import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool, ensureSchema } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth, issueToken } from '../auth.js';

const router = Router();

const USER_FIELDS = 'id, name, email, role, approved, created_at';

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    await ensureSchema();
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    const isFirstUser = countRows[0].count === 0;

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, approved)
       VALUES ($1, $2, $3, $4, $5) RETURNING ${USER_FIELDS}`,
      [name, normalizedEmail, passwordHash, isFirstUser ? 'admin' : 'user', isFirstUser ? 1 : 0]
    );
    const user = rows[0];

    if (!user.approved) {
      return res.status(201).json({
        pending: true,
        message: 'Your account has been created and is waiting for admin approval before you can log in.',
      });
    }
    res.status(201).json({ token: issueToken(user.id), user });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    await ensureSchema();
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [(email || '').toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password || '', user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    if (!user.approved) {
      return res.status(403).json({ error: 'Your account is awaiting admin approval.' });
    }

    res.json({
      token: issueToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
        created_at: user.created_at,
      },
    });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: rows[0] });
  })
);

router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows: currentRows } = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [
      req.userId,
    ]);
    const current = currentRows[0];
    if (!current) return res.status(404).json({ error: 'User not found.' });

    const name = req.body.name?.trim() || current.name;
    const email = req.body.email?.trim().toLowerCase() || current.email;

    if (email !== current.email) {
      const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (rows.length > 0) return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, req.userId]);

    if (req.body.password) {
      if (!req.body.current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const { rows: fullRows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
      const valid = await bcrypt.compare(req.body.current_password, fullRows[0].password_hash);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
      if (req.body.password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      const newHash = await bcrypt.hash(req.body.password, 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.userId]);
    }

    const { rows } = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [req.userId]);
    res.json({ user: rows[0] });
  })
);

export default router;
