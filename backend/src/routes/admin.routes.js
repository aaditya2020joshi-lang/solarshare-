import { Router } from 'express';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

const listUsers = db.prepare(
  'SELECT id, name, email, role, approved, created_at FROM users ORDER BY created_at DESC'
);
const getUser = db.prepare('SELECT id, name, email, role, approved, created_at FROM users WHERE id = ?');
const setApproved = db.prepare('UPDATE users SET approved = ? WHERE id = ?');
const deleteUser = db.prepare('DELETE FROM users WHERE id = ?');

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    res.json({ users: listUsers.all() });
  })
);

router.post(
  '/users/:id/approve',
  asyncHandler(async (req, res) => {
    const user = getUser.get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    setApproved.run(1, user.id);
    res.json({ user: getUser.get(user.id) });
  })
);

router.post(
  '/users/:id/revoke',
  asyncHandler(async (req, res) => {
    const user = getUser.get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (Number(user.id) === req.userId) {
      return res.status(400).json({ error: 'You cannot revoke your own access.' });
    }
    setApproved.run(0, user.id);
    res.json({ user: getUser.get(user.id) });
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = getUser.get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (Number(user.id) === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    deleteUser.run(user.id);
    res.status(204).end();
  })
);

export default router;
