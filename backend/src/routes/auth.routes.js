import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const findByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const countUsers = db.prepare('SELECT COUNT(*) AS count FROM users');
const insertUser = db.prepare(
  'INSERT INTO users (name, email, password_hash, role, approved) VALUES (?, ?, ?, ?, ?)'
);
const findById = db.prepare('SELECT id, name, email, role, approved, created_at FROM users WHERE id = ?');
const findFullById = db.prepare('SELECT * FROM users WHERE id = ?');
const updateProfile = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
const updatePassword = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');

function issueToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (findByEmail.get(email.toLowerCase())) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const isFirstUser = countUsers.get().count === 0;
    const passwordHash = await bcrypt.hash(password, 10);
    const result = insertUser.run(
      name,
      email.toLowerCase(),
      passwordHash,
      isFirstUser ? 'admin' : 'user',
      isFirstUser ? 1 : 0
    );
    const user = findById.get(result.lastInsertRowid);

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
    const { email, password } = req.body;
    const user = findByEmail.get((email || '').toLowerCase());
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
    const user = findById.get(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  })
);

router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const current = findById.get(req.userId);
    if (!current) return res.status(404).json({ error: 'User not found.' });

    const name = req.body.name?.trim() || current.name;
    const email = req.body.email?.trim().toLowerCase() || current.email;

    if (email !== current.email && findByEmail.get(email)) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    updateProfile.run(name, email, req.userId);

    if (req.body.password) {
      if (!req.body.current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const full = findFullById.get(req.userId);
      const valid = await bcrypt.compare(req.body.current_password, full.password_hash);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
      if (req.body.password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      const newHash = await bcrypt.hash(req.body.password, 10);
      updatePassword.run(newHash, req.userId);
    }

    res.json({ user: findById.get(req.userId) });
  })
);

export default router;
