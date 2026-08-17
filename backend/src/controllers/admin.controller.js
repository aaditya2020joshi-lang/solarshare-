import { pool } from '../config/db.js';

export async function getUsers(req, res) {
  const result = await pool.query(
    `SELECT id, name, email, location, is_admin, created_at
     FROM users ORDER BY created_at DESC`
  );
  res.json(result.rows);
}

export async function getStats(req, res) {
  const users = await pool.query(`SELECT COUNT(*)::int AS total FROM users`);
  res.json({ users: users.rows[0] });
}
