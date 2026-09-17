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
