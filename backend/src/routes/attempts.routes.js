import { Router } from 'express';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const recentAttempts = db.prepare(`
  SELECT a.id, a.score, a.total, a.completed_at, t.title AS test_title, s.name AS subject_name
  FROM attempts a
  JOIN tests t ON t.id = a.test_id
  JOIN subjects s ON s.id = t.subject_id
  WHERE a.user_id = ?
  ORDER BY a.completed_at DESC
  LIMIT ?
`);

const getAttempt = db.prepare(`
  SELECT a.*, t.title AS test_title
  FROM attempts a
  JOIN tests t ON t.id = a.test_id
  WHERE a.id = ? AND a.user_id = ?
`);
const questionsForTest = db.prepare('SELECT * FROM questions WHERE test_id = ? ORDER BY order_index ASC, id ASC');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    res.json({ attempts: recentAttempts.all(req.userId, limit) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const attempt = getAttempt.get(req.params.id, req.userId);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

    const answers = JSON.parse(attempt.answers);
    const questions = questionsForTest.all(attempt.test_id).map((q, i) => ({
      id: q.id,
      question_text: q.question_text,
      options: JSON.parse(q.options),
      correct_index: q.correct_index,
      explanation: q.explanation,
      selected_index: answers[i] ?? null,
    }));

    res.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        total: attempt.total,
        completed_at: attempt.completed_at,
        test_title: attempt.test_title,
      },
      questions,
    });
  })
);

export default router;
