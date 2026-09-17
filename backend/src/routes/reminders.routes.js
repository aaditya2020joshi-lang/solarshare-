import { Router } from 'express';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const listReminders = db.prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY remind_at ASC');
const insertReminder = db.prepare(`
  INSERT INTO reminders (user_id, title, message, remind_at, repeat) VALUES (?, ?, ?, ?, ?)
`);
const getReminder = db.prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?');
const updateReminder = db.prepare(`
  UPDATE reminders SET title = ?, message = ?, remind_at = ?, repeat = ?, sent = 0 WHERE id = ? AND user_id = ?
`);
const deleteReminder = db.prepare('DELETE FROM reminders WHERE id = ? AND user_id = ?');

const VALID_REPEATS = ['none', 'daily', 'weekly'];

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ reminders: listReminders.all(req.userId) });
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

    const result = insertReminder.run(
      req.userId,
      title.trim(),
      message?.trim() || null,
      new Date(remind_at).toISOString(),
      repeatValue
    );
    res.status(201).json({ reminder: getReminder.get(result.lastInsertRowid, req.userId) });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const reminder = getReminder.get(req.params.id, req.userId);
    if (!reminder) return res.status(404).json({ error: 'Reminder not found.' });

    const title = req.body.title?.trim() || reminder.title;
    const message = req.body.message !== undefined ? req.body.message?.trim() || null : reminder.message;
    const remindAt = req.body.remind_at ? new Date(req.body.remind_at).toISOString() : reminder.remind_at;
    const repeat = VALID_REPEATS.includes(req.body.repeat) ? req.body.repeat : reminder.repeat;

    updateReminder.run(title, message, remindAt, repeat, reminder.id, req.userId);
    res.json({ reminder: getReminder.get(reminder.id, req.userId) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = deleteReminder.run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Reminder not found.' });
    res.status(204).end();
  })
);

export default router;
