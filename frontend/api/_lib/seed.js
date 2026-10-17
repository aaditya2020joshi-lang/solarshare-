import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

// Starter content lives in frontend/content/<Subject name>/*.json. Each file may hold
// { "tests": [...], "notes": [...] }. Every user gets their own copy, once; items they
// later delete are remembered in seeded_content and not added back.
const CONTENT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');

function loadContent() {
  const out = [];
  if (!fs.existsSync(CONTENT_DIR)) return out;
  for (const dir of fs.readdirSync(CONTENT_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const entry = { subject: dir.name, tests: [], notes: [], flashcards: [] };
    for (const file of fs.readdirSync(path.join(CONTENT_DIR, dir.name)).sort()) {
      if (!file.endsWith('.json')) continue;
      const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, dir.name, file), 'utf8'));
      entry.tests.push(...(data.tests || []));
      entry.notes.push(...(data.notes || []));
      entry.flashcards.push(...(data.flashcards || []));
    }
    out.push(entry);
  }
  return out;
}

const content = loadContent();
const seededUsers = new Set();

// Multi-row INSERT so a first-time seed takes a handful of round trips instead of thousands.
async function insertRows(client, table, columns, rows, suffix = '') {
  const CHUNK = Math.max(1, Math.floor(30000 / columns.length));
  for (let i = 0; i < rows.length; i += CHUNK) {
    const part = rows.slice(i, i + CHUNK);
    const params = [];
    const tuples = part.map((row) => {
      const marks = row.map((value) => {
        params.push(value);
        return `$${params.length}`;
      });
      return `(${marks.join(', ')})`;
    });
    await client.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES ${tuples.join(', ')} ${suffix}`, params);
  }
}

export async function seedUserContent(userId) {
  if (seededUsers.has(userId) || content.length === 0) return;
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const done = new Set(
      (await client.query('SELECT item_key FROM seeded_content WHERE user_id = $1', [userId])).rows.map((r) => r.item_key)
    );
    const marks = [];

    for (const { subject, tests, notes, flashcards } of content) {
      // A test with a "rev" replaces an older version: the old copy is renamed "(Easy) ..." and the new one is added.
      const testKey = (t) => `${subject}|test|${t.title}${t.rev ? `|r${t.rev}` : ''}`;
      const newTests = tests.filter((t) => !done.has(testKey(t)));
      // A note with a "rev" number is re-sent to users when the number changes, so corrections reach existing copies.
      const noteKey = (n) => `${subject}|note|${n.title}${n.rev ? `|r${n.rev}` : ''}`;
      const newNotes = notes.filter((n) => !done.has(noteKey(n)));
      const newCards = flashcards.filter((c) => !done.has(`${subject}|flashcard|${c.front}`));
      if (newTests.length + newNotes.length + newCards.length === 0) continue;

      let subjectId = (
        await client.query('SELECT id FROM subjects WHERE user_id = $1 AND name = $2', [userId, subject])
      ).rows[0]?.id;
      if (!subjectId) {
        subjectId = (
          await client.query('INSERT INTO subjects (user_id, name) VALUES ($1, $2) RETURNING id', [userId, subject])
        ).rows[0].id;
      }

      // Anything already there (imported by hand earlier) is recorded as seeded instead of duplicated.
      const existing = async (table, column) =>
        new Set(
          (await client.query(`SELECT ${column} AS v FROM ${table} WHERE subject_id = $1`, [subjectId])).rows.map((r) => r.v)
        );
      const haveTests = await existing('tests', 'title');
      const haveNotes = await existing('notes', 'title');
      const haveCards = await existing('flashcards', 'front');

      for (const t of newTests) {
        marks.push([userId, testKey(t)]);
        if (haveTests.has(t.title)) {
          if (!t.rev) continue;
          await client.query(
            "UPDATE tests SET title = '(Easy) ' || title WHERE subject_id = $1 AND title = $2 AND title NOT LIKE '(Easy) %'",
            [subjectId, t.title]
          );
        }
        const { rows } = await client.query(
          'INSERT INTO tests (subject_id, user_id, title, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING id',
          [subjectId, userId, t.title, t.duration_minutes || 30]
        );
        await insertRows(
          client,
          'questions',
          ['test_id', 'question_text', 'options', 'correct_index', 'explanation', 'order_index'],
          t.questions.map((q, i) => [rows[0].id, q.question_text, JSON.stringify(q.options), q.correct_index, q.explanation || null, i])
        );
      }

      let order = Number((await client.query('SELECT COALESCE(MAX(order_index), 0) AS m FROM notes WHERE subject_id = $1', [subjectId])).rows[0].m);
      const noteRows = [];
      for (const n of newNotes) {
        marks.push([userId, noteKey(n)]);
        if (haveNotes.has(n.title)) {
          if (n.rev) {
            await client.query('UPDATE notes SET content = $1, group_name = $2 WHERE subject_id = $3 AND title = $4', [
              n.content,
              n.group_name || '',
              subjectId,
              n.title,
            ]);
          }
          continue;
        }
        noteRows.push([subjectId, userId, n.group_name || '', n.title, n.content, ++order]);
      }
      await insertRows(client, 'notes', ['subject_id', 'user_id', 'group_name', 'title', 'content', 'order_index'], noteRows);

      const cardRows = [];
      for (const c of newCards) {
        marks.push([userId, `${subject}|flashcard|${c.front}`]);
        if (haveCards.has(c.front)) continue;
        cardRows.push([subjectId, userId, c.front, c.back]);
      }
      await insertRows(client, 'flashcards', ['subject_id', 'user_id', 'front', 'back'], cardRows);
    }

    await insertRows(client, 'seeded_content', ['user_id', 'item_key'], marks, 'ON CONFLICT DO NOTHING');
    await client.query('COMMIT');
    seededUsers.add(userId);
  } catch (err) {
    await client?.query('ROLLBACK').catch(() => {});
    console.error('seed failed:', err.message);
  } finally {
    client?.release();
  }
}
