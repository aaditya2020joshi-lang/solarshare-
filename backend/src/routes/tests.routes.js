import { Router } from 'express';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const getTest = db.prepare('SELECT * FROM tests WHERE id = ? AND user_id = ?');
const updateTest = db.prepare('UPDATE tests SET title = ?, duration_minutes = ? WHERE id = ? AND user_id = ?');
const deleteTest = db.prepare('DELETE FROM tests WHERE id = ? AND user_id = ?');
const questionsForTest = db.prepare('SELECT * FROM questions WHERE test_id = ? ORDER BY order_index ASC, id ASC');
const insertQuestion = db.prepare(`
  INSERT INTO questions (test_id, question_text, options, correct_index, explanation, order_index)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const deleteQuestion = db.prepare('DELETE FROM questions WHERE id = ? AND test_id = ?');
const maxOrderIndex = db.prepare('SELECT COALESCE(MAX(order_index), -1) AS max FROM questions WHERE test_id = ?');

const insertAttempt = db.prepare(`
  INSERT INTO attempts (test_id, user_id, score, total, answers, started_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const attemptsForTest = db.prepare(
  'SELECT id, score, total, completed_at FROM attempts WHERE test_id = ? AND user_id = ? ORDER BY completed_at DESC'
);

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
    const test = getTest.get(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    const questions = questionsForTest.all(test.id).map((q) => parseQuestion(q, { includeAnswer: true }));
    res.json({ test, questions });
  })
);

router.get(
  '/:id/take',
  asyncHandler(async (req, res) => {
    const test = getTest.get(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    const questions = questionsForTest.all(test.id).map((q) => parseQuestion(q, { includeAnswer: false }));
    res.json({ test, questions });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const test = getTest.get(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    const title = req.body.title?.trim() || test.title;
    const duration = Number(req.body.duration_minutes) || test.duration_minutes;
    updateTest.run(title, duration, test.id, req.userId);
    res.json({ test: getTest.get(test.id, req.userId) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = deleteTest.run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Test not found.' });
    res.status(204).end();
  })
);

router.post(
  '/:id/questions',
  asyncHandler(async (req, res) => {
    const test = getTest.get(req.params.id, req.userId);
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

    const nextOrder = maxOrderIndex.get(test.id).max + 1;
    const result = insertQuestion.run(
      test.id,
      question_text.trim(),
      JSON.stringify(options.map((o) => o.trim())),
      idx,
      explanation?.trim() || null,
      nextOrder
    );
    res.status(201).json({ questionId: result.lastInsertRowid });
  })
);

router.delete(
  '/:id/questions/:questionId',
  asyncHandler(async (req, res) => {
    const test = getTest.get(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    const result = deleteQuestion.run(req.params.questionId, test.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Question not found.' });
    res.status(204).end();
  })
);

router.post(
  '/:id/attempts',
  asyncHandler(async (req, res) => {
    const test = getTest.get(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });

    const { answers, started_at } = req.body;
    const questions = questionsForTest.all(test.id);
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ error: 'Answers must match the number of questions.' });
    }

    const score = questions.reduce((total, q, i) => total + (answers[i] === q.correct_index ? 1 : 0), 0);
    const result = insertAttempt.run(
      test.id,
      req.userId,
      score,
      questions.length,
      JSON.stringify(answers),
      started_at || new Date().toISOString()
    );
    res.status(201).json({ attemptId: result.lastInsertRowid, score, total: questions.length });
  })
);

router.get(
  '/:id/attempts',
  asyncHandler(async (req, res) => {
    const test = getTest.get(req.params.id, req.userId);
    if (!test) return res.status(404).json({ error: 'Test not found.' });
    res.json({ attempts: attemptsForTest.all(test.id, req.userId) });
  })
);

export default router;
