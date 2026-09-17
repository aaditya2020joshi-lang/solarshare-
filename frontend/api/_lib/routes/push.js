import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';
import { sendNotificationToUser, isPushConfigured } from '../pushService.js';

const router = Router();

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
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`,
      [req.userId, endpoint, keys.p256dh, keys.auth]
    );
    res.status(201).json({ ok: true });
  })
);

router.post(
  '/unsubscribe',
  asyncHandler(async (req, res) => {
    const { endpoint } = req.body;
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2', [
      endpoint,
      req.userId,
    ]);
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
