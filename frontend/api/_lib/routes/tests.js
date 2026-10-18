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


const TOPIC_STOP = new Set(
  ('a an the is are was were be been of in on at to for from by with and or but if then so as it its this that these those ' +
    'what which who how do does did can could should would will may might must not no yes all any each their they them ' +
    'one two three more most such also than into about between used use using other like given following correct best ' +
    'basic first second main general').split(' ')
);
const TITLE_GENERIC = new Set(
  ('mean meaning need needs types type definition definitions concept concepts introduction overview basics basic importance ' +
    'features feature nature scope role roles essentials essential application applications principles principle theory ' +
    'process steps advantages limitations objectives characteristics difference differences classification').split(' ')
);
const TOPIC_SIZE = 12;
const TOPIC_MIN = 5;

function topicWords(text, limit) {
  const freq = new Map();
  for (const w of text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)) {
    if (w.length < 4 || TOPIC_STOP.has(w) || /^\d/.test(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([w]) => w);
}

function stem(w) {
  return w.length > 5 ? w.replace(/(ing|ment|tion|ies|es|s|ed|al)$/, '') : w;
}

function hits(text, stems) {
  const t = text.toLowerCase();
  let n = 0;
  for (const st of stems) if (st.length > 2 && t.includes(st)) n += 1;
  return n;
}

// Build (once) a short quiz for one note, made of the questions that mention that topic.
router.post(
  '/topic',
  asyncHandler(async (req, res) => {
    const { rows: noteRows } = await pool.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [
      req.body.note_id,
      req.userId,
    ]);
    const note = noteRows[0];
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    const baseTitle = `Topic quiz – ${note.title}`;
    const cleanTitle = note.title.replace(/^[\d.]+\s*/, '');
    const titleStems = topicWords(cleanTitle, 8).filter((w) => !TITLE_GENERIC.has(w)).map(stem);
    const bodyStems = topicWords(note.content, 14).map(stem);
    if (!titleStems.length && !bodyStems.length) {
      return res.status(400).json({ error: 'This note is too short to build a quiz from.' });
    }

    const unit = (note.group_name || '').split(':')[0].trim();
    const { rows: pool_ } = await pool.query(
      `SELECT q.question_text, q.options, q.correct_index, q.explanation, t.title AS test_title
       FROM questions q JOIN tests t ON t.id = q.test_id
       WHERE t.subject_id = $1 AND t.user_id = $2 AND t.title NOT LIKE '(Easy)%' AND t.title NOT LIKE 'Topic quiz%'`,
      [note.subject_id, req.userId]
    );

    // Drop words that appear in a large share of all questions (like "manage"); they do not identify a topic.
    const texts = pool_.map((q) => `${q.question_text} ${q.options} ${q.explanation || ''}`.toLowerCase());
    const df = (st) => texts.reduce((n, t) => n + (t.includes(st) ? 1 : 0), 0);
    const specific = (stems, share) => {
      const withDf = stems.map((st) => [st, df(st)]).sort((a, b) => a[1] - b[1]);
      const keep = withDf.filter(([, d]) => d <= Math.max(15, texts.length * share)).map(([st]) => st);
      return keep.length ? keep : withDf.slice(0, 1).map(([st]) => st);
    };
    const tStems = specific(titleStems, 0.04);
    const bStems = specific(bodyStems, 0.08);

    const seen = new Set();
    const scored = [];
    for (let i = 0; i < pool_.length; i += 1) {
      const q = pool_[i];
      const key = q.question_text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const tHits = hits(texts[i], tStems);
      const bHits = hits(texts[i], bStems);
      const inUnit = unit && q.test_title.startsWith(`${unit}:`) ? 1 : 0;
      // A question must mention the topic name, or several specific terms of the note from the same unit.
      if (tHits === 0 && !(inUnit && bHits >= 3)) continue;
      scored.push({ q, score: tHits * 10 + bHits * 2 + inUnit * 4 });
    }
    scored.sort((a, b) => b.score - a.score);

    // Questions used in earlier quizzes on this topic, so each press tries to bring new ones.
    const likeBase = `${baseTitle.replace(/[\\%_]/g, '\\$&')}%`;
    const { rows: oldTests } = await pool.query(
      `SELECT t.id, (SELECT COUNT(*) FROM attempts a WHERE a.test_id = t.id)::int AS attempts
       FROM tests t WHERE t.subject_id = $1 AND t.user_id = $2 AND t.title LIKE $3`,
      [note.subject_id, req.userId, likeBase]
    );
    const usedBefore = new Set();
    if (oldTests.length) {
      const { rows: oldQs } = await pool.query(
        'SELECT question_text FROM questions WHERE test_id = ANY($1::int[])',
        [oldTests.map((t) => t.id)]
      );
      for (const r of oldQs) usedBefore.add(r.question_text.toLowerCase());
    }

    // Take the best-matching candidates, shuffle them, and put never-used questions first.
    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const candidates = shuffle(scored.slice(0, TOPIC_SIZE * 4).map((x) => x.q));
    const fresh = candidates.filter((q) => !usedBefore.has(q.question_text.toLowerCase()));
    const stale = candidates.filter((q) => usedBefore.has(q.question_text.toLowerCase()));
    const picked = [...fresh, ...stale].slice(0, TOPIC_SIZE);

    // Topic is thinly covered: top up with questions from the same unit that share the note's key terms.
    if (picked.length < TOPIC_MIN && unit) {
      const have = new Set(picked.map((q) => q.question_text.toLowerCase()));
      const extra = [];
      for (let i = 0; i < pool_.length; i += 1) {
        const q = pool_[i];
        const key = q.question_text.toLowerCase();
        if (have.has(key) || !q.test_title.startsWith(`${unit}:`)) continue;
        have.add(key);
        extra.push({ q, score: hits(texts[i], bStems) });
      }
      extra.sort((a, b) => b.score - a.score);
      for (const x of extra) {
        if (picked.length >= 8) break;
        if (x.score > 0) picked.push(x.q);
      }
    }
    if (picked.length < TOPIC_MIN) {
      return res.status(400).json({ error: 'Not enough questions on this topic yet. Try the unit tests instead.' });
    }

    // Old unattempted quizzes on this topic are just clutter; attempted ones stay for the results history.
    const unattempted = oldTests.filter((t) => t.attempts === 0).map((t) => t.id);
    if (unattempted.length) {
      await pool.query('DELETE FROM questions WHERE test_id = ANY($1::int[])', [unattempted]);
      await pool.query('DELETE FROM tests WHERE id = ANY($1::int[])', [unattempted]);
    }
    const title = `${baseTitle} · Set ${oldTests.filter((t) => t.attempts > 0).length + 1}`;

    const { rows: created } = await pool.query(
      'INSERT INTO tests (subject_id, user_id, title, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING id',
      [note.subject_id, req.userId, title, Math.max(10, picked.length)]
    );
    const ordered = shuffle(picked);
    for (let i = 0; i < ordered.length; i += 1) {
      const q = ordered[i];
      const opts = JSON.parse(q.options);
      const order = shuffle(opts.map((_, k) => k));
      const newOptions = order.map((k) => opts[k]);
      const newCorrect = order.indexOf(q.correct_index);
      await pool.query(
        'INSERT INTO questions (test_id, question_text, options, correct_index, explanation, order_index) VALUES ($1, $2, $3, $4, $5, $6)',
        [created[0].id, q.question_text, JSON.stringify(newOptions), newCorrect, q.explanation, i]
      );
    }
    res.json({ test_id: created[0].id, count: picked.length });
  })
);

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
