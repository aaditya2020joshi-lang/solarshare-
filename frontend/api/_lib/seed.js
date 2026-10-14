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
    const entry = { subject: dir.name, tests: [], notes: [] };
    for (const file of fs.readdirSync(path.join(CONTENT_DIR, dir.name)).sort()) {
      if (!file.endsWith('.json')) continue;
      const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, dir.name, file), 'utf8'));
      entry.tests.push(...(data.tests || []));
      entry.notes.push(...(data.notes || []));
    }
    out.push(entry);
  }
  return out;
}

const content = loadContent();
const seededUsers = new Set();

export async function seedUserContent(userId) {
  if (seededUsers.has(userId) || content.length === 0) return;
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const done = new Set(
      (await client.query('SELECT item_key FROM seeded_content WHERE user_id = $1', [userId])).rows.map((r) => r.item_key)
    );
    const mark = (key) =>
      client.query('INSERT INTO seeded_content (user_id, item_key) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, key]);

    for (const { subject, tests, notes } of content) {
      const items = [
        ...tests.map((t) => ({ kind: 'test', item: t })),
        ...notes.map((n) => ({ kind: 'note', item: n })),
      ].filter(({ kind, item }) => !done.has(`${subject}|${kind}|${item.title}`));
      if (items.length === 0) continue;

      let subjectId = (
        await client.query('SELECT id FROM subjects WHERE user_id = $1 AND name = $2', [userId, subject])
      ).rows[0]?.id;
      if (!subjectId) {
        subjectId = (
          await client.query('INSERT INTO subjects (user_id, name) VALUES ($1, $2) RETURNING id', [userId, subject])
        ).rows[0].id;
      }

      for (const { kind, item } of items) {
        // Already imported by hand earlier: record it and move on rather than duplicating.
        const table = kind === 'test' ? 'tests' : 'notes';
        const dup = await client.query(`SELECT 1 FROM ${table} WHERE subject_id = $1 AND title = $2`, [subjectId, item.title]);
        if (dup.rows.length > 0) {
          await mark(`${subject}|${kind}|${item.title}`);
          continue;
        }
        if (kind === 'test') {
          const { rows } = await client.query(
            'INSERT INTO tests (subject_id, user_id, title, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING id',
            [subjectId, userId, item.title, item.duration_minutes || 30]
          );
          for (const [i, q] of item.questions.entries()) {
            await client.query(
              `INSERT INTO questions (test_id, question_text, options, correct_index, explanation, order_index)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [rows[0].id, q.question_text, JSON.stringify(q.options), q.correct_index, q.explanation || null, i]
            );
          }
        } else {
          await client.query(
            `INSERT INTO notes (subject_id, user_id, group_name, title, content, order_index)
             VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM notes WHERE subject_id = $1))`,
            [subjectId, userId, item.group_name || '', item.title, item.content]
          );
        }
        await mark(`${subject}|${kind}|${item.title}`);
      }
    }
    await client.query('COMMIT');
    seededUsers.add(userId);
  } catch (err) {
    await client?.query('ROLLBACK').catch(() => {});
    console.error('seed failed:', err.message);
  } finally {
    client?.release();
  }
}
