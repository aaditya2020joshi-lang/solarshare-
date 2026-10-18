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
    // Keep a per-day record that mirrors today's counter, for the history view.
    await pool.query(
      `INSERT INTO site_time_daily (user_id, day, seconds)
       SELECT user_id, today_date, today_seconds FROM site_time WHERE user_id = $1
       ON CONFLICT (user_id, day) DO UPDATE SET seconds = EXCLUDED.seconds`,
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

// Lets a user correct their own time for today, e.g. when they studied before the timer was switched on.
router.post(
  '/set-today',
  asyncHandler(async (req, res) => {
    const minutes = Math.round(Number(req.body?.minutes));
    if (!Number.isFinite(minutes) || minutes < 0 || minutes > 24 * 60) {
      return res.status(400).json({ error: 'Enter a time between 0 and 24 hours.' });
    }
    const seconds = minutes * 60;
    await pool.query(
      `INSERT INTO site_time (user_id, total_seconds, today_seconds, today_date, last_seen)
       VALUES ($1, $2, $2, ${TODAY}, now())
       ON CONFLICT (user_id) DO UPDATE SET
         total_seconds = site_time.total_seconds
           - (CASE WHEN site_time.today_date = ${TODAY} THEN site_time.today_seconds ELSE 0 END) + $2,
         today_seconds = $2,
         today_date = ${TODAY},
         last_seen = now()`,
      [req.userId, seconds]
    );
    await pool.query(
      `INSERT INTO site_time_daily (user_id, day, seconds) VALUES ($1, ${TODAY}, $2)
       ON CONFLICT (user_id, day) DO UPDATE SET seconds = EXCLUDED.seconds`,
      [req.userId, seconds]
    );
    res.json({ ok: true });
  })
);

router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const target = Number(req.query.user_id) || req.userId;
    const { rows } = await pool.query(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day, seconds FROM site_time_daily
       WHERE user_id = $1 AND day >= ${TODAY} - 59 ORDER BY day DESC`,
      [target]
    );
    const { rows: who } = await pool.query('SELECT name FROM users WHERE id = $1', [target]);
    res.json({ user_id: target, name: who[0]?.name || '', days: rows.map((r) => ({ day: r.day, seconds: Number(r.seconds) })) });
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
