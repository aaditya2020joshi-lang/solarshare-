import { pool } from '../config/db.js';

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

export async function getProfile(req, res) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(toPublicUser(user));
}

export async function updateProfile(req, res) {
  const { name, location, communityPriority } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const existing = result.rows[0];
  if (!existing) return res.status(404).json({ error: 'User not found' });

  const nextName = name ?? existing.name;
  const nextLocation = location ?? existing.location;
  const nextPriority =
    existing.role === 'buyer' && typeof communityPriority === 'boolean'
      ? communityPriority
      : existing.community_priority;

  const updated = await pool.query(
    `UPDATE users SET name = $1, location = $2, community_priority = $3
     WHERE id = $4 RETURNING *`,
    [nextName, nextLocation, nextPriority, req.user.id]
  );

  res.json(toPublicUser(updated.rows[0]));
}
