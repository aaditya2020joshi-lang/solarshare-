import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    communityPriority: user.community_priority,
    location: user.location,
  };
}

export async function signup(req, res) {
  const { name, email, password, role, location, communityPriority } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password, and role are required' });
  }
  if (!['seller', 'buyer'].includes(role)) {
    return res.status(400).json({ error: 'role must be "seller" or "buyer"' });
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const isPriority = role === 'buyer' ? Boolean(communityPriority) : false;

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, community_priority, location)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, email, passwordHash, role, isPriority, location || null]
  );

  const user = result.rows[0];
  res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ token: signToken(user), user: toPublicUser(user) });
}
