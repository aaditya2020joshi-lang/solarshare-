import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

const VALID_REPEATS = ['none', 'daily', 'weekly'];

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM reminders WHERE user_id = $1 ORDER BY remind_at ASC', [
      req.userId,
    ]);
    res.json({ reminders: rows });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title, message, remind_at, repeat } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' });
    if (!remind_at || Number.isNaN(new Date(remind_at).getTime())) {
      return res.status(400).json({ error: 'A valid date/time is required.' });
    }
    const repeatValue = VALID_REPEATS.includes(repeat) ? repeat : 'none';

    const { rows } = await pool.query(
      `INSERT INTO reminders (user_id, title, message, remind_at, repeat)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, title.trim(), message?.trim() || null, new Date(remind_at).toISOString(), repeatValue]
    );
    res.status(201).json({ reminder: rows[0] });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows: currentRows } = await pool.query('SELECT * FROM reminders WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    const reminder = currentRows[0];
    if (!reminder) return res.status(404).json({ error: 'Reminder not found.' });

    const title = req.body.title?.trim() || reminder.title;
    const message = req.body.message !== undefined ? req.body.message?.trim() || null : reminder.message;
    const remindAt = req.body.remind_at ? new Date(req.body.remind_at).toISOString() : reminder.remind_at;
    const repeat = VALID_REPEATS.includes(req.body.repeat) ? req.body.repeat : reminder.repeat;

    const { rows } = await pool.query(
      `UPDATE reminders SET title = $1, message = $2, remind_at = $3, repeat = $4, sent = 0
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [title, message, remindAt, repeat, reminder.id, req.userId]
    );
    res.json({ reminder: rows[0] });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM reminders WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    if (rowCount === 0) return res.status(404).json({ error: 'Reminder not found.' });
    res.status(204).end();
  })
);

export default router;
