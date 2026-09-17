import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

const USER_FIELDS = 'id, name, email, role, approved, created_at';

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`SELECT ${USER_FIELDS} FROM users ORDER BY created_at DESC`);
    res.json({ users: rows });
  })
);

router.post(
  '/users/:id/approve',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE users SET approved = 1 WHERE id = $1 RETURNING ${USER_FIELDS}`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: rows[0] });
  })
);

router.post(
  '/users/:id/revoke',
  asyncHandler(async (req, res) => {
    if (Number(req.params.id) === req.userId) {
      return res.status(400).json({ error: 'You cannot revoke your own access.' });
    }
    const { rows } = await pool.query(
      `UPDATE users SET approved = 0 WHERE id = $1 RETURNING ${USER_FIELDS}`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: rows[0] });
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (Number(req.params.id) === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'User not found.' });
    res.status(204).end();
  })
);

export default router;
