import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.created_at, COUNT(t.id)::int AS test_count
       FROM subjects s
       LEFT JOIN tests t ON t.subject_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [req.userId]
    );
    res.json({ subjects: rows });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Subject name is required.' });
    const { rows } = await pool.query(
      'INSERT INTO subjects (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.userId, name.trim()]
    );
    res.status(201).json({ subject: rows[0] });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows: subjectRows } = await pool.query('SELECT * FROM subjects WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    const subject = subjectRows[0];
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const { rows: tests } = await pool.query(
      `SELECT t.id, t.title, t.duration_minutes, t.created_at, COUNT(q.id)::int AS question_count
       FROM tests t
       LEFT JOIN questions q ON q.test_id = t.id
       WHERE t.subject_id = $1 AND t.user_id = $2
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [subject.id, req.userId]
    );
    res.json({ subject, tests });
  })
);

router.post(
  '/:id/tests',
  asyncHandler(async (req, res) => {
    const { rows: subjectRows } = await pool.query('SELECT * FROM subjects WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    const subject = subjectRows[0];
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const { title, duration_minutes } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Test title is required.' });

    const { rows } = await pool.query(
      'INSERT INTO tests (subject_id, user_id, title, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING id',
      [subject.id, req.userId, title.trim(), Number(duration_minutes) || 30]
    );
    res.status(201).json({ testId: rows[0].id });
  })
);

const MAX_IMPORT_TESTS = 20;
const MAX_IMPORT_QUESTIONS = 500;

function normalizeImport(body) {
  const list = Array.isArray(body) ? body : Array.isArray(body?.tests) ? body.tests : body?.title ? [body] : null;
  if (!list || list.length === 0) return { error: 'Provide a test, a list of tests, or { "tests": [...] }.' };
  if (list.length > MAX_IMPORT_TESTS) return { error: `You can import at most ${MAX_IMPORT_TESTS} tests at once.` };

  let totalQuestions = 0;
  const tests = [];
  for (const [ti, t] of list.entries()) {
    const label = `Test ${ti + 1}`;
    if (typeof t?.title !== 'string' || !t.title.trim()) return { error: `${label}: a title is required.` };
    if (!Array.isArray(t.questions) || t.questions.length === 0) {
      return { error: `${label} ("${t.title}"): at least one question is required.` };
    }
    const questions = [];
    for (const [qi, q] of t.questions.entries()) {
      const qlabel = `${label}, question ${qi + 1}`;
      if (typeof q?.question_text !== 'string' || !q.question_text.trim()) {
        return { error: `${qlabel}: question_text is required.` };
      }
      if (!Array.isArray(q.options) || q.options.length < 2 || q.options.some((o) => typeof o !== 'string' || !o.trim())) {
        return { error: `${qlabel}: at least two non-empty options are required.` };
      }
      const idx = Number(q.correct_index);
      if (!Number.isInteger(idx) || idx < 0 || idx >= q.options.length) {
        return { error: `${qlabel}: correct_index must point to one of the options (starting from 0).` };
      }
      questions.push({
        question_text: q.question_text.trim(),
        options: q.options.map((o) => o.trim()),
        correct_index: idx,
        explanation: typeof q.explanation === 'string' && q.explanation.trim() ? q.explanation.trim() : null,
      });
    }
    totalQuestions += questions.length;
    tests.push({ title: t.title.trim(), duration_minutes: Number(t.duration_minutes) || 30, questions });
  }
  if (totalQuestions > MAX_IMPORT_QUESTIONS) {
    return { error: `You can import at most ${MAX_IMPORT_QUESTIONS} questions at once.` };
  }
  return { tests };
}

router.post(
  '/:id/import-tests',
  asyncHandler(async (req, res) => {
    const { rows: subjectRows } = await pool.query('SELECT * FROM subjects WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    const subject = subjectRows[0];
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const parsed = normalizeImport(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const created = [];
    const skipped = [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const t of parsed.tests) {
        const existing = await client.query('SELECT id FROM tests WHERE subject_id = $1 AND title = $2', [
          subject.id,
          t.title,
        ]);
        if (existing.rows.length > 0) {
          skipped.push(t.title);
          continue;
        }
        const { rows } = await client.query(
          'INSERT INTO tests (subject_id, user_id, title, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING id',
          [subject.id, req.userId, t.title, t.duration_minutes]
        );
        for (const [i, q] of t.questions.entries()) {
          await client.query(
            `INSERT INTO questions (test_id, question_text, options, correct_index, explanation, order_index)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [rows[0].id, q.question_text, JSON.stringify(q.options), q.correct_index, q.explanation, i]
          );
        }
        created.push({ id: rows[0].id, title: t.title, question_count: t.questions.length });
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.status(201).json({ created, skipped });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM subjects WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    if (rowCount === 0) return res.status(404).json({ error: 'Subject not found.' });
    res.status(204).end();
  })
);

export default router;
