import jwt from 'jsonwebtoken';
import { pool, ensureSchema } from './db.js';

export function issueToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    await ensureSchema();
    const { rows } = await pool.query('SELECT id, role, approved FROM users WHERE id = $1', [payload.userId]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid or expired token' });
    if (!user.approved) {
      return res.status(403).json({ error: 'Your account is awaiting admin approval.' });
    }
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}
