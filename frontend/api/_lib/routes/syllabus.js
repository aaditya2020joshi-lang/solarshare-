import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


// A vocabulary of every word in the starter notes, flash cards and questions, used to fix spelling mistakes.
const CONTENT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'content');
let vocab = null;
function getVocab() {
  if (vocab) return vocab;
  const counts = new Map();
  const add = (text) => {
    for (const w of String(text || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)) {
      if (w.length >= 4) counts.set(w, (counts.get(w) || 0) + 1);
    }
  };
  try {
    for (const dir of fs.readdirSync(CONTENT_DIR, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      for (const file of fs.readdirSync(path.join(CONTENT_DIR, dir.name))) {
        if (!file.endsWith('.json')) continue;
        const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, dir.name, file), 'utf8'));
        (data.notes || []).forEach((n) => { add(n.title); add(n.content); });
        (data.flashcards || []).forEach((c) => { add(c.front); add(c.back); });
        (data.tests || []).forEach((t) => t.questions.forEach((q) => { add(q.question_text); add(q.explanation); }));
      }
    }
  } catch {
    // no starter content: spelling help is simply off
  }
  vocab = counts;
  return vocab;
}

// Optimal string alignment distance (counts a swap of two neighbouring letters as one mistake).
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

export function fixSpelling(word) {
  const v = getVocab();
  if (word.length < 5 || v.has(word) || v.size === 0) return word;
  const maxDist = word.length >= 8 ? 2 : 1;
  let best = null;
  for (const [cand, freq] of v) {
    if (Math.abs(cand.length - word.length) > maxDist || cand[0] !== word[0]) continue;
    const dist = distance(word, cand);
    if (dist <= maxDist && (!best || dist < best.dist || (dist === best.dist && freq > best.freq))) best = { cand, dist, freq };
  }
  return best ? best.cand : word;
}

const router = Router();
router.use(requireAuth);

const STOP = new Set(
  ('a an the is are was were be been being of in on at to for from by with and or but if then so as it its this that these those ' +
    'what which who whom whose when where why how do does did done can could should would will shall may might must ' +
    'me my we our you your they their them he she his her i about explain define meaning mean tell give write short note ' +
    'difference between full form example examples types type').split(' ')
);

function keywords(q) {
  const words = q
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
  return [...new Set(words)].slice(0, 8);
}

const esc = (s) => s.replace(/[\%_]/g, '\$&');

// Count how many keywords appear in the text and how often, so more complete matches rank higher.
function score(text, words) {
  const t = text.toLowerCase();
  let hit = 0;
  let total = 0;
  for (const w of words) {
    const c = t.split(w).length - 1;
    if (c > 0) {
      hit += 1;
      total += Math.min(c, 5);
    }
  }
  return hit * 10 + total;
}

// Pick the few note lines that best match the question so the answer is short, not the whole note.
function bestSnippet(content, words) {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const scored = lines.map((line, i) => ({ line, i, s: score(line, words) })).filter((x) => x.s > 0);
  if (!scored.length) return lines.slice(0, 4).join('\n');
  scored.sort((a, b) => b.s - a.s);
  const top = scored.slice(0, 5).sort((a, b) => a.i - b.i);
  return top.map((x) => x.line).join('\n').slice(0, 900);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 3) return res.status(400).json({ error: 'Type your question first.' });
    const original = keywords(q);
    const words = original.map(fixSpelling);
    const corrected = words.some((w, i) => w !== original[i]) ? words.join(' ') : null;
    if (!words.length) return res.json({ words, results: [], corrected });
    const patterns = words.map((w) => `%${esc(w)}%`);

    const [notes, cards, questions] = await Promise.all([
      pool.query(
        `SELECT n.id, n.title, n.content, n.group_name, s.id AS subject_id, s.name AS subject_name
         FROM notes n JOIN subjects s ON s.id = n.subject_id
         WHERE n.user_id = $1 AND (n.title ILIKE ANY($2) OR n.content ILIKE ANY($2)) LIMIT 150`,
        [req.userId, patterns]
      ),
      pool.query(
        `SELECT f.id, f.front, f.back, s.id AS subject_id, s.name AS subject_name
         FROM flashcards f JOIN subjects s ON s.id = f.subject_id
         WHERE f.user_id = $1 AND (f.front ILIKE ANY($2) OR f.back ILIKE ANY($2)) LIMIT 150`,
        [req.userId, patterns]
      ),
      pool.query(
        `SELECT q.id, q.question_text, q.options, q.correct_index, q.explanation, t.title AS test_title, s.name AS subject_name
         FROM questions q JOIN tests t ON t.id = q.test_id JOIN subjects s ON s.id = t.subject_id
         WHERE t.user_id = $1 AND t.title NOT LIKE '(Easy)%'
           AND (q.question_text ILIKE ANY($2) OR COALESCE(q.explanation, '') ILIKE ANY($2)) LIMIT 150`,
        [req.userId, patterns]
      ),
    ]);

    const results = [];
    for (const f of cards.rows) {
      const s = score(f.front, words) * 2 + score(f.back, words);
      results.push({ type: 'flashcard', score: s + 8, subject_name: f.subject_name, title: f.front, text: f.back });
    }
    for (const n of notes.rows) {
      const s = score(n.title, words) * 3 + score(n.content, words);
      results.push({
        type: 'note',
        score: s,
        subject_id: n.subject_id,
        subject_name: n.subject_name,
        title: n.title,
        group: n.group_name,
        text: bestSnippet(n.content, words),
      });
    }
    const seen = new Set();
    for (const r of questions.rows) {
      const key = r.question_text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const options = JSON.parse(r.options);
      const s = score(r.question_text, words) * 2 + score(r.explanation || '', words);
      results.push({
        type: 'question',
        score: s,
        subject_name: r.subject_name,
        title: r.question_text,
        text: `Answer: ${options[r.correct_index]}${r.explanation ? `\n${r.explanation}` : ''}`,
      });
    }

    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, 12);
    const best = top[0]?.score || 0;
    // Drop weak matches that only touch one word when a much better match exists.
    const filtered = top.filter((r) => r.score >= Math.max(10, best * 0.3));
    res.json({ words, results: filtered, corrected });
  })
);

export default router;
