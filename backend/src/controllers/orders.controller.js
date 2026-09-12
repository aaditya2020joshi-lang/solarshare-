import crypto from 'crypto';
import Razorpay from 'razorpay';
import { pool } from '../config/db.js';

const UNIT_PRICE = 799;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createOrder(req, res) {
  const { customerName, email, phone, address, city, pincode, quantity } = req.body;

  if (!customerName || !email || !phone || !address || !city || !pincode || !quantity) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'quantity must be a whole number of at least 1' });
  }

  const totalAmount = UNIT_PRICE * qty;

  const orderResult = await pool.query(
    `INSERT INTO orders (customer_name, email, phone, address, city, pincode, quantity, unit_price, total_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [customerName, email, phone, address, city, pincode, qty, UNIT_PRICE, totalAmount]
  );
  const order = orderResult.rows[0];

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
    receipt: `powerglove_order_${order.id}`,
  });

  const updated = await pool.query(
    `UPDATE orders SET razorpay_order_id = $1 WHERE id = $2 RETURNING *`,
    [razorpayOrder.id, order.id]
  );

  res.status(201).json({ ...updated.rows[0], razorpay_key_id: process.env.RAZORPAY_KEY_ID });
}

export async function getOrder(req, res) {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  const order = result.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ ...order, razorpay_key_id: process.env.RAZORPAY_KEY_ID });
}

export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing Razorpay payment fields' });
  }

  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  const order = result.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status === 'paid') {
    return res.status(409).json({ error: 'This order has already been paid' });
  }
  if (order.razorpay_order_id !== razorpay_order_id) {
    return res.status(400).json({ error: 'Order mismatch' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment signature verification failed' });
  }

  const updated = await pool.query(
    `UPDATE orders SET status = 'paid', razorpay_payment_id = $1, paid_at = now() WHERE id = $2 RETURNING *`,
    [razorpay_payment_id, req.params.id]
  );

  res.json(updated.rows[0]);
}

export async function getAdminOrders(req, res) {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  const stats = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'paid')::int AS paid_orders,
       COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0)::float AS total_revenue,
       COALESCE(SUM(quantity) FILTER (WHERE status = 'paid'), 0)::int AS units_sold
     FROM orders`
  );

  res.json({ orders: result.rows, stats: stats.rows[0] });
}
