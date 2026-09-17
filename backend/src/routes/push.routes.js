import { Router } from 'express';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { sendNotificationToUser, isPushConfigured } from '../services/pushService.js';

const router = Router();

const upsertSubscription = db.prepare(`
  INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)
  ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth
`);
const deleteSubscription = db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?');

router.get('/vapid-public-key', (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(503).json({ error: 'Push notifications are not configured on the server.' });
  }
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.use(requireAuth);

router.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'A valid push subscription is required.' });
    }
    upsertSubscription.run(req.userId, endpoint, keys.p256dh, keys.auth);
    res.status(201).json({ ok: true });
  })
);

router.post(
  '/unsubscribe',
  asyncHandler(async (req, res) => {
    const { endpoint } = req.body;
    deleteSubscription.run(endpoint, req.userId);
    res.status(204).end();
  })
);

router.post(
  '/test',
  asyncHandler(async (req, res) => {
    if (!isPushConfigured()) {
      return res.status(503).json({ error: 'Push notifications are not configured on the server.' });
    }
    const result = await sendNotificationToUser(req.userId, {
      title: 'Test notification',
      body: 'Push notifications are working.',
      url: '/reminders',
    });
    res.json(result);
  })
);

export default router;
