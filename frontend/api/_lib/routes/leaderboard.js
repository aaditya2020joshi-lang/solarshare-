import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

// Every user has their own copy of each test, so a test is identified by its subject name and title.
const BEST_PER_TEST = `
  SELECT a.user_id, s.name AS subject, t.title,
         MAX(a.score::float / NULLIF(a.total, 0) * 100) AS pct
  FROM attempts a
  JOIN tests t ON t.id = a.test_id
  JOIN subjects s ON s.id = t.subject_id
  WHERE t.title NOT LIKE 'Topic quiz%'
  GROUP BY a.user_id, s.name, t.title
`;

// Overall board: points = sum of each user's best percentage on every distinct test.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const { rows } = await pool.query(
      `WITH best AS (${BEST_PER_TEST}),
       ranked AS (
         SELECT u.id AS user_id, u.name,
                COUNT(*)::int AS tests_done,
                ROUND(AVG(b.pct))::int AS avg_percent,
                ROUND(SUM(b.pct))::int AS points,
                RANK() OVER (ORDER BY ROUND(SUM(b.pct)) DESC, ROUND(AVG(b.pct)) DESC) AS rank
         FROM best b
         JOIN users u ON u.id = b.user_id
         WHERE u.approved = 1
         GROUP BY u.id, u.name
       )
       SELECT * FROM ranked ORDER BY rank, name`
    );
    const top = rows.slice(0, limit).map((r) => ({ ...r, rank: Number(r.rank), is_me: r.user_id === req.userId }));
    const mine = rows.find((r) => r.user_id === req.userId);
    res.json({
      leaders: top,
      me: mine ? { ...mine, rank: Number(mine.rank) } : null,
      participants: rows.length,
    });
  })
);

// Board for one test (matched by subject name and title across all users).
router.get(
  '/test/:id',
  asyncHandler(async (req, res) => {
    const { rows: found } = await pool.query(
      `SELECT t.title, s.name AS subject FROM tests t JOIN subjects s ON s.id = t.subject_id
       WHERE t.id = $1 AND t.user_id = $2`,
      [req.params.id, req.userId]
    );
    if (!found[0]) return res.status(404).json({ error: 'Test not found.' });

    const { rows } = await pool.query(
      `WITH best AS (
         SELECT DISTINCT ON (a.user_id) a.user_id, a.score, a.total, a.completed_at,
                ROUND(a.score::float / NULLIF(a.total, 0) * 100)::int AS percent
         FROM attempts a
         JOIN tests t ON t.id = a.test_id
         JOIN subjects s ON s.id = t.subject_id
         WHERE s.name = $1 AND t.title = $2
         ORDER BY a.user_id, a.score::float / NULLIF(a.total, 0) DESC, a.completed_at ASC
       )
       SELECT u.id AS user_id, u.name, b.score, b.total, b.percent,
              RANK() OVER (ORDER BY b.percent DESC, b.completed_at ASC) AS rank
       FROM best b JOIN users u ON u.id = b.user_id
       WHERE u.approved = 1
       ORDER BY rank, u.name`,
      [found[0].subject, found[0].title]
    );
    res.json({
      test: found[0],
      leaders: rows.slice(0, 10).map((r) => ({ ...r, rank: Number(r.rank), is_me: r.user_id === req.userId })),
      me: rows.filter((r) => r.user_id === req.userId).map((r) => ({ ...r, rank: Number(r.rank) }))[0] || null,
      participants: rows.length,
    });
  })
);

export default router;
