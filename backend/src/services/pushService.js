import webpush from 'web-push';
import { db } from '../config/db.js';

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

const removeSubscription = db.prepare('DELETE FROM push_subscriptions WHERE id = ?');
const subsForUser = db.prepare('SELECT * FROM push_subscriptions WHERE user_id = ?');

export async function sendNotificationToUser(userId, payload) {
  if (!ensureConfigured()) {
    throw new Error('Push notifications are not configured on the server (missing VAPID keys).');
  }
  const subscriptions = subsForUser.all(userId);
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      )
    )
  );

  results.forEach((result, i) => {
    if (result.status === 'rejected' && [404, 410].includes(result.reason?.statusCode)) {
      removeSubscription.run(subscriptions[i].id);
    }
  });

  return {
    sent: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  };
}
