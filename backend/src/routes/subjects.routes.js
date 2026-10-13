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

const findTestByTitle = db.prepare('SELECT id FROM tests WHERE subject_id = ? AND title = ?');
const insertQuestionRow = db.prepare(`
  INSERT INTO questions (test_id, question_text, options, correct_index, explanation, order_index)
  VALUES (?, ?, ?, ?, ?, ?)
`);

router.post(
  '/:id/import-tests',
  asyncHandler(async (req, res) => {
    const subject = getSubject.get(req.params.id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const parsed = normalizeImport(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const created = [];
    const skipped = [];
    db.transaction(() => {
      for (const t of parsed.tests) {
        if (findTestByTitle.get(subject.id, t.title)) {
          skipped.push(t.title);
          continue;
        }
        const result = insertTest.run(subject.id, req.userId, t.title, t.duration_minutes);
        t.questions.forEach((q, i) =>
          insertQuestionRow.run(
            result.lastInsertRowid,
            q.question_text,
            JSON.stringify(q.options),
            q.correct_index,
            q.explanation,
            i
          )
        );
        created.push({ id: Number(result.lastInsertRowid), title: t.title, question_count: t.questions.length });
      }
    })();

    res.status(201).json({ created, skipped });
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
