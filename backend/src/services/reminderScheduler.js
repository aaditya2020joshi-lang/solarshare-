import cron from 'node-cron';
import { db } from '../config/db.js';
import { sendNotificationToUser, isPushConfigured } from './pushService.js';

const dueReminders = db.prepare(`
  SELECT * FROM reminders WHERE sent = 0 AND datetime(remind_at) <= datetime('now')
`);
const markSent = db.prepare('UPDATE reminders SET sent = 1 WHERE id = ?');
const reschedule = db.prepare('UPDATE reminders SET remind_at = ? WHERE id = ?');

function nextOccurrence(remindAt, repeat) {
  const date = new Date(remindAt);
  if (repeat === 'daily') date.setDate(date.getDate() + 1);
  else if (repeat === 'weekly') date.setDate(date.getDate() + 7);
  return date.toISOString();
}

async function processDueReminders() {
  if (!isPushConfigured()) return;
  const due = dueReminders.all();
  for (const reminder of due) {
    try {
      await sendNotificationToUser(reminder.user_id, {
        title: reminder.title,
        body: reminder.message || 'Time to study!',
        url: '/reminders',
      });
    } catch (err) {
      console.error(`Failed to send reminder ${reminder.id}:`, err.message);
    }

    if (reminder.repeat === 'none') {
      markSent.run(reminder.id);
    } else {
      reschedule.run(nextOccurrence(reminder.remind_at, reminder.repeat), reminder.id);
    }
  }
}

export function startReminderScheduler() {
  cron.schedule('* * * * *', processDueReminders);
  console.log('Reminder scheduler running (checks every minute).');
}
