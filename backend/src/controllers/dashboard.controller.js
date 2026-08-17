import { pool } from '../config/db.js';

export async function getMyDashboard(req, res) {
  const result = await pool.query(
    `SELECT name, email, location, created_at FROM users WHERE id = $1`,
    [req.user.id]
  );
  res.json({ user: result.rows[0] });
}
