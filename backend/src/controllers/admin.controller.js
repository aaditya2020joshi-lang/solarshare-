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
  const [users, listings, transactions, panelOrders] = await Promise.all([
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
    pool.query(
      `SELECT
         COUNT(*)::int AS completed,
         COALESCE(SUM(total_amount), 0)::float AS total_value,
         COALESCE(SUM(platform_fee), 0)::float AS platform_revenue,
         COALESCE(AVG(total_amount), 0)::float AS avg_order_value
       FROM panel_orders WHERE status = 'payment_claimed'`
    ),
  ]);

  res.json({
    users: users.rows[0],
    listings: listings.rows[0],
    transactions: transactions.rows[0],
    panelOrders: panelOrders.rows[0],
  });
}

export async function getRecentTransactions(req, res) {
  const result = await pool.query(
    `SELECT panel_orders.id, panel_orders.total_amount, panel_orders.platform_fee,
            panel_orders.razorpay_payment_id, panel_orders.paid_claimed_at,
            panels.name AS panel_name, vendors.name AS vendor_name, users.name AS buyer_name
     FROM panel_orders
     JOIN panels ON panels.id = panel_orders.panel_id
     JOIN vendors ON vendors.id = panels.vendor_id
     JOIN users ON users.id = panel_orders.buyer_id
     WHERE panel_orders.status = 'payment_claimed'
     ORDER BY panel_orders.paid_claimed_at DESC
     LIMIT 10`
  );
  res.json(result.rows);
}
