import webpush from 'web-push';
import { pool } from './db.js';

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

export function isPushConfigured() {
  return ensureConfigured();
}

export async function sendNotificationToUser(userId, payload) {
  if (!ensureConfigured()) {
    throw new Error('Push notifications are not configured on the server (missing VAPID keys).');
  }
  const { rows: subscriptions } = await pool.query('SELECT * FROM push_subscriptions WHERE user_id = $1', [
    userId,
  ]);

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );

  await Promise.all(
    results.map((result, i) => {
      if (result.status === 'rejected' && [404, 410].includes(result.reason?.statusCode)) {
        return pool.query('DELETE FROM push_subscriptions WHERE id = $1', [subscriptions[i].id]);
      }
      return null;
    })
  );

  return {
    sent: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  };
}
