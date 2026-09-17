import { Router } from 'express';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const listSubjects = db.prepare(`
  SELECT s.id, s.name, s.created_at, COUNT(t.id) AS test_count
  FROM subjects s
  LEFT JOIN tests t ON t.subject_id = s.id
  WHERE s.user_id = ?
  GROUP BY s.id
  ORDER BY s.created_at DESC
`);
const insertSubject = db.prepare('INSERT INTO subjects (user_id, name) VALUES (?, ?)');
const getSubject = db.prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?');
const deleteSubject = db.prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?');
const testsForSubject = db.prepare(`
  SELECT t.id, t.title, t.duration_minutes, t.created_at, COUNT(q.id) AS question_count
  FROM tests t
  LEFT JOIN questions q ON q.test_id = t.id
  WHERE t.subject_id = ? AND t.user_id = ?
  GROUP BY t.id
  ORDER BY t.created_at DESC
`);
const insertTest = db.prepare(
  'INSERT INTO tests (subject_id, user_id, title, duration_minutes) VALUES (?, ?, ?, ?)'
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ subjects: listSubjects.all(req.userId) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Subject name is required.' });
    const result = insertSubject.run(req.userId, name.trim());
    res.status(201).json({ subject: getSubject.get(result.lastInsertRowid, req.userId) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const subject = getSubject.get(req.params.id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    res.json({ subject, tests: testsForSubject.all(subject.id, req.userId) });
  })
);

router.post(
  '/:id/tests',
  asyncHandler(async (req, res) => {
    const subject = getSubject.get(req.params.id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const { title, duration_minutes } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Test title is required.' });

    const result = insertTest.run(subject.id, req.userId, title.trim(), Number(duration_minutes) || 30);
    res.status(201).json({ testId: result.lastInsertRowid });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = deleteSubject.run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Subject not found.' });
    res.status(204).end();
  })
);

export default router;
