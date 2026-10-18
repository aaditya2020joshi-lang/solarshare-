import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

// A browser pings every ~10 seconds while the site is open and visible. A user counts as "on the site"
// if we heard from them in the last 30 seconds; time only grows while pings keep arriving.
const ONLINE_WINDOW_S = 30;
const MAX_GAP_S = 30;
const TODAY = "(now() AT TIME ZONE 'Asia/Kolkata')::date";

router.post(
  '/ping',
  asyncHandler(async (req, res) => {
    await pool.query(
      `INSERT INTO site_time (user_id, total_seconds, today_seconds, today_date, last_seen)
       VALUES ($1, 0, 0, ${TODAY}, now())
       ON CONFLICT (user_id) DO UPDATE SET
         today_seconds = CASE WHEN site_time.today_date = ${TODAY} THEN site_time.today_seconds ELSE 0 END
           + LEAST(GREATEST(EXTRACT(EPOCH FROM (now() - site_time.last_seen))::int, 0), ${MAX_GAP_S}) *
             (CASE WHEN EXTRACT(EPOCH FROM (now() - site_time.last_seen)) <= ${MAX_GAP_S} THEN 1 ELSE 0 END),
         total_seconds = site_time.total_seconds
           + LEAST(GREATEST(EXTRACT(EPOCH FROM (now() - site_time.last_seen))::int, 0), ${MAX_GAP_S}) *
             (CASE WHEN EXTRACT(EPOCH FROM (now() - site_time.last_seen)) <= ${MAX_GAP_S} THEN 1 ELSE 0 END),
         today_date = ${TODAY},
         last_seen = now()`,
      [req.userId]
    );
    res.json({ ok: true });
  })
);

// Sent when the tab closes so the timer stops straight away instead of after the 30-second window.
router.post(
  '/leave',
  asyncHandler(async (req, res) => {
    await pool.query("UPDATE site_time SET last_seen = now() - interval '5 minutes' WHERE user_id = $1", [req.userId]);
    res.json({ ok: true });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT u.id, u.name,
              COALESCE(CASE WHEN st.today_date = ${TODAY} THEN st.today_seconds END, 0) AS today_seconds,
              COALESCE(st.total_seconds, 0) AS total_seconds,
              COALESCE(EXTRACT(EPOCH FROM (now() - st.last_seen)) <= ${ONLINE_WINDOW_S}, false) AS online
       FROM users u LEFT JOIN site_time st ON st.user_id = u.id
       WHERE u.approved = 1
       ORDER BY u.id`
    );
    res.json({
      me: req.userId,
      users: rows.map((r) => ({
        id: r.id,
        name: r.name,
        today_seconds: Number(r.today_seconds),
        total_seconds: Number(r.total_seconds),
        online: r.online === true,
      })),
    });
  })
);

export default router;
