import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const findUser = db.prepare('SELECT id, role, approved FROM users WHERE id = ?');

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = findUser.get(payload.userId);
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
