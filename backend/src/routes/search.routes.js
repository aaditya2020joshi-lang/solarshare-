import { Router } from 'express';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const LIMIT = 20;

const searchSubjects = db.prepare(`
  SELECT id, name FROM subjects
  WHERE user_id = @userId AND name LIKE @pattern ESCAPE '\\' AND (@subjectId IS NULL OR id = @subjectId)
  ORDER BY name LIMIT ${LIMIT}
`);
const searchTests = db.prepare(`
  SELECT t.id, t.title, s.name AS subject_name
  FROM tests t JOIN subjects s ON s.id = t.subject_id
  WHERE t.user_id = @userId AND t.title LIKE @pattern ESCAPE '\\' AND (@subjectId IS NULL OR t.subject_id = @subjectId)
  ORDER BY t.title LIMIT ${LIMIT}
`);
const searchQuestions = db.prepare(`
  SELECT q.id, q.test_id, q.question_text, q.options, q.correct_index, q.explanation,
         t.title AS test_title, s.name AS subject_name
  FROM questions q
  JOIN tests t ON t.id = q.test_id
  JOIN subjects s ON s.id = t.subject_id
  WHERE t.user_id = @userId AND (@subjectId IS NULL OR t.subject_id = @subjectId)
    AND (q.question_text LIKE @pattern ESCAPE '\\' OR q.options LIKE @pattern ESCAPE '\\'
         OR COALESCE(q.explanation, '') LIKE @pattern ESCAPE '\\')
  ORDER BY q.id LIMIT ${LIMIT}
`);
const searchFlashcards = db.prepare(`
  SELECT f.id, f.subject_id, f.front, f.back, s.name AS subject_name
  FROM flashcards f JOIN subjects s ON s.id = f.subject_id
  WHERE f.user_id = @userId AND (@subjectId IS NULL OR f.subject_id = @subjectId)
    AND (f.front LIKE @pattern ESCAPE '\\' OR f.back LIKE @pattern ESCAPE '\\')
  ORDER BY f.id LIMIT ${LIMIT}
`);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.status(400).json({ error: 'Type at least 2 characters to search.' });
    const params = {
      userId: req.userId,
      pattern: `%${q.replace(/[\\%_]/g, '\\$&')}%`,
      subjectId: req.query.subject_id ? Number(req.query.subject_id) : null,
    };

    res.json({
      subjects: searchSubjects.all(params),
      tests: searchTests.all(params),
      questions: searchQuestions.all(params).map((r) => ({
        id: r.id,
        test_id: r.test_id,
        question_text: r.question_text,
        answer: JSON.parse(r.options)[r.correct_index],
        explanation: r.explanation,
        test_title: r.test_title,
        subject_name: r.subject_name,
      })),
      flashcards: searchFlashcards.all(params),
    });
  })
);

export default router;
