import { pool, ensureSchema } from '../_lib/db.js';
import { sendNotificationToUser, isPushConfigured } from '../_lib/pushService.js';

function nextOccurrence(remindAt, repeat) {
  const date = new Date(remindAt);
  if (repeat === 'daily') date.setDate(date.getDate() + 1);
  else if (repeat === 'weekly') date.setDate(date.getDate() + 7);
  return date.toISOString();
}

export default async function handler(req, res) {
  // Vercel Cron requests carry this header automatically when CRON_SECRET is set as an env var.
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await ensureSchema();

  if (!isPushConfigured()) {
    return res.json({ checked: 0, note: 'Push not configured (missing VAPID keys).' });
  }

  const { rows: due } = await pool.query(
    "SELECT * FROM reminders WHERE sent = 0 AND remind_at <= now()"
  );

  let sent = 0;
  for (const reminder of due) {
    try {
      await sendNotificationToUser(reminder.user_id, {
        title: reminder.title,
        body: reminder.message || 'Time to study!',
        url: '/reminders',
      });
      sent += 1;
    } catch (err) {
      console.error(`Failed to send reminder ${reminder.id}:`, err.message);
    }

    if (reminder.repeat === 'none') {
      await pool.query('UPDATE reminders SET sent = 1 WHERE id = $1', [reminder.id]);
    } else {
      await pool.query('UPDATE reminders SET remind_at = $1 WHERE id = $2', [
        nextOccurrence(reminder.remind_at, reminder.repeat),
        reminder.id,
      ]);
    }
  }

  res.json({ checked: due.length, sent });
}
