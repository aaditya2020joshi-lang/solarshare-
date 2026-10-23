import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

const TODAY = "(now() AT TIME ZONE 'Asia/Kolkata')::date";

// A simple overview of everyone using the site. Emails are only shown to their owner.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              COALESCE(st.total_seconds, 0) AS total_seconds,
              COALESCE(CASE WHEN st.today_date = ${TODAY} THEN st.today_seconds END, 0) AS today_seconds,
              st.last_seen,
              COALESCE(EXTRACT(EPOCH FROM (now() - st.last_seen)) <= 30, false) AS online,
              (SELECT COUNT(*)::int FROM attempts a WHERE a.user_id = u.id) AS tests_taken,
              (SELECT ROUND(AVG(a.score::numeric / NULLIF(a.total, 0) * 100))::int FROM attempts a WHERE a.user_id = u.id) AS avg_score
       FROM users u LEFT JOIN site_time st ON st.user_id = u.id
       WHERE u.approved = 1
       ORDER BY u.id`
    );
    res.json({
      me: req.userId,
      accounts: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.id === req.userId ? r.email : null,
        role: r.role,
        joined: r.created_at,
        total_seconds: Number(r.total_seconds),
        today_seconds: Number(r.today_seconds),
        last_seen: r.last_seen,
        online: r.online === true,
        tests_taken: r.tests_taken,
        avg_score: r.avg_score,
      })),
    });
  })
);

export default router;
