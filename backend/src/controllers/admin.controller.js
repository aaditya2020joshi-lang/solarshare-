import { pool } from '../config/db.js';

export async function getUsers(req, res) {
  const result = await pool.query(
    `SELECT id, name, email, role, location, community_priority, is_admin, created_at
     FROM users ORDER BY created_at DESC`
  );
  res.json(result.rows);
}

export async function getListings(req, res) {
  const result = await pool.query(
    `SELECT listings.*, users.name AS seller_name, users.email AS seller_email
     FROM listings
     JOIN users ON users.id = listings.seller_id
     ORDER BY listings.created_at DESC`
  );
  res.json(result.rows);
}

export async function getStats(req, res) {
  const [users, listings, transactions] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE role = 'seller')::int AS sellers,
         COUNT(*) FILTER (WHERE role = 'buyer')::int AS buyers,
         COUNT(*) FILTER (WHERE community_priority)::int AS priority_buyers
       FROM users`
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'active')::int AS active
       FROM listings`
    ),
    pool.query(
      `SELECT
         COUNT(*)::int AS completed,
         COALESCE(SUM(kwh_requested), 0)::float AS total_kwh,
         COALESCE(SUM(kwh_requested * price_applied), 0)::float AS total_value
       FROM requests WHERE status = 'accepted'`
    ),
  ]);

  res.json({
    users: users.rows[0],
    listings: listings.rows[0],
    transactions: transactions.rows[0],
  });
}
