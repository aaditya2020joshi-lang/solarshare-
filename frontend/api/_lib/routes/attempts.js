import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const { rows } = await pool.query(
      `SELECT a.id, a.score, a.total, a.completed_at, t.title AS test_title, s.name AS subject_name
       FROM attempts a
       JOIN tests t ON t.id = a.test_id
       JOIN subjects s ON s.id = t.subject_id
       WHERE a.user_id = $1
       ORDER BY a.completed_at DESC
       LIMIT $2`,
      [req.userId, limit]
    );
    res.json({ attempts: rows });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows: attemptRows } = await pool.query(
      `SELECT a.*, t.title AS test_title
       FROM attempts a
       JOIN tests t ON t.id = a.test_id
       WHERE a.id = $1 AND a.user_id = $2`,
      [req.params.id, req.userId]
    );
    const attempt = attemptRows[0];
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

    const answers = JSON.parse(attempt.answers);
    const { rows: questionRows } = await pool.query(
      'SELECT * FROM questions WHERE test_id = $1 ORDER BY order_index ASC, id ASC',
      [attempt.test_id]
    );
    const questions = questionRows.map((q, i) => ({
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
