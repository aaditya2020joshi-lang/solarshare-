import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

async function getOwnedTest(id, userId) {
  const { rows } = await pool.query('SELECT * FROM tests WHERE id = $1 AND user_id = $2', [id, userId]);
  return rows[0];
}

async function getQuestions(testId) {
  const { rows } = await pool.query(
    'SELECT * FROM questions WHERE test_id = $1 ORDER BY order_index ASC, id ASC',
    [testId]
  );
  return rows;
}

function parseQuestion(row, { includeAnswer }) {
  const base = {
    id: row.id,
    question_text: row.question_text,
    options: JSON.parse(row.options),
  };
  if (includeAnswer) {
    base.correct_index = row.correct_index;
    base.explanation = row.explanation;
  }
  return base;
}

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const test = await getOwnedTest(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    const questions = (await getQuestions(test.id)).map((q) => parseQuestion(q, { includeAnswer: true }));
    res.json({ test, questions });
  })
);

router.get(
  '/:id/take',
  asyncHandler(async (req, res) => {
    const test = await getOwnedTest(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    const questions = (await getQuestions(test.id)).map((q) => parseQuestion(q, { includeAnswer: false }));
    res.json({ test, questions });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const test = await getOwnedTest(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    const title = req.body.title?.trim() || test.title;
    const duration = Number(req.body.duration_minutes) || test.duration_minutes;
    await pool.query('UPDATE tests SET title = $1, duration_minutes = $2 WHERE id = $3 AND user_id = $4', [
      title,
      duration,
      test.id,
      req.userId,
    ]);
    res.json({ test: await getOwnedTest(test.id, req.userId) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM tests WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    if (rowCount === 0) return res.status(404).json({ error: 'Test not found.' });
    res.status(204).end();
  })
);

router.post(
  '/:id/questions',
  asyncHandler(async (req, res) => {
    const test = await getOwnedTest(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });

    const { question_text, options, correct_index, explanation } = req.body;
    if (!question_text?.trim()) return res.status(400).json({ error: 'Question text is required.' });
    if (!Array.isArray(options) || options.length < 2 || options.some((o) => !o?.trim())) {
      return res.status(400).json({ error: 'At least two non-empty options are required.' });
    }
    const idx = Number(correct_index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= options.length) {
      return res.status(400).json({ error: 'A valid correct option must be selected.' });
    }

    const { rows: maxRows } = await pool.query(
      'SELECT COALESCE(MAX(order_index), -1) AS max FROM questions WHERE test_id = $1',
      [test.id]
    );
    const nextOrder = maxRows[0].max + 1;

    const { rows } = await pool.query(
      `INSERT INTO questions (test_id, question_text, options, correct_index, explanation, order_index)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        test.id,
        question_text.trim(),
        JSON.stringify(options.map((o) => o.trim())),
        idx,
        explanation?.trim() || null,
        nextOrder,
      ]
    );
    res.status(201).json({ questionId: rows[0].id });
  })
);

router.delete(
  '/:id/questions/:questionId',
  asyncHandler(async (req, res) => {
    const test = await getOwnedTest(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    const { rowCount } = await pool.query('DELETE FROM questions WHERE id = $1 AND test_id = $2', [
      req.params.questionId,
      test.id,
    ]);
    if (rowCount === 0) return res.status(404).json({ error: 'Question not found.' });
    res.status(204).end();
  })
);

router.post(
  '/:id/attempts',
  asyncHandler(async (req, res) => {
    const test = await getOwnedTest(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });

    const { answers, started_at } = req.body;
    const questions = await getQuestions(test.id);
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ error: 'Answers must match the number of questions.' });
    }

    const score = questions.reduce((total, q, i) => total + (answers[i] === q.correct_index ? 1 : 0), 0);
    const { rows } = await pool.query(
      `INSERT INTO attempts (test_id, user_id, score, total, answers, started_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [test.id, req.userId, score, questions.length, JSON.stringify(answers), started_at || new Date().toISOString()]
    );
    res.status(201).json({ attemptId: rows[0].id, score, total: questions.length });
  })
);

router.get(
  '/:id/attempts',
  asyncHandler(async (req, res) => {
    const test = await getOwnedTest(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    const { rows } = await pool.query(
      'SELECT id, score, total, completed_at FROM attempts WHERE test_id = $1 AND user_id = $2 ORDER BY completed_at DESC',
      [test.id, req.userId]
    );
    res.json({ attempts: rows });
  })
);

export default router;
