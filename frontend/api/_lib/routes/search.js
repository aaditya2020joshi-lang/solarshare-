import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

const LIMIT = 20;

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.status(400).json({ error: 'Type at least 2 characters to search.' });
    const pattern = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
    const subjectId = req.query.subject_id ? Number(req.query.subject_id) : null;

    const [subjects, tests, questions, flashcards] = await Promise.all([
      pool.query(
        `SELECT id, name FROM subjects
         WHERE user_id = $1 AND name ILIKE $2 AND ($3::int IS NULL OR id = $3)
         ORDER BY name LIMIT ${LIMIT}`,
        [req.userId, pattern, subjectId]
      ),
      pool.query(
        `SELECT t.id, t.title, s.name AS subject_name
         FROM tests t JOIN subjects s ON s.id = t.subject_id
         WHERE t.user_id = $1 AND t.title ILIKE $2 AND ($3::int IS NULL OR t.subject_id = $3)
         ORDER BY t.title LIMIT ${LIMIT}`,
        [req.userId, pattern, subjectId]
      ),
      pool.query(
        `SELECT q.id, q.test_id, q.question_text, q.options, q.correct_index, q.explanation,
                t.title AS test_title, s.name AS subject_name
         FROM questions q
         JOIN tests t ON t.id = q.test_id
         JOIN subjects s ON s.id = t.subject_id
         WHERE t.user_id = $1 AND ($3::int IS NULL OR t.subject_id = $3)
           AND (q.question_text ILIKE $2 OR q.options ILIKE $2 OR COALESCE(q.explanation, '') ILIKE $2)
         ORDER BY q.id LIMIT ${LIMIT}`,
        [req.userId, pattern, subjectId]
      ),
      pool.query(
        `SELECT f.id, f.subject_id, f.front, f.back, s.name AS subject_name
         FROM flashcards f JOIN subjects s ON s.id = f.subject_id
         WHERE f.user_id = $1 AND ($3::int IS NULL OR f.subject_id = $3)
           AND (f.front ILIKE $2 OR f.back ILIKE $2)
         ORDER BY f.id LIMIT ${LIMIT}`,
        [req.userId, pattern, subjectId]
      ),
    ]);

    res.json({
      subjects: subjects.rows,
      tests: tests.rows,
      questions: questions.rows.map((r) => {
        const options = JSON.parse(r.options);
        return {
          id: r.id,
          test_id: r.test_id,
          question_text: r.question_text,
          answer: options[r.correct_index],
          explanation: r.explanation,
          test_title: r.test_title,
          subject_name: r.subject_name,
        };
      }),
      flashcards: flashcards.rows,
    });
  })
);

export default router;
