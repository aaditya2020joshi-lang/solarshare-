import { pool } from '../config/db.js';

export async function getMyDashboard(req, res) {
  const result = await pool.query(
    `SELECT name, email, location, created_at FROM users WHERE id = $1`,
    [req.user.id]
  );
  if (!result.rows[0]) {
    return res.status(401).json({ error: 'Account no longer exists' });
  }
  res.json({ user: result.rows[0] });
}
