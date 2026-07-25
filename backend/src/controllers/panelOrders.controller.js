import crypto from 'crypto';
import Razorpay from 'razorpay';
import { pool } from '../config/db.js';

const PLATFORM_FEE = 49;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createPanelOrder(req, res) {
  const { panelId, quantity } = req.body;
  if (!panelId || !quantity) {
    return res.status(400).json({ error: 'panelId and quantity are required' });
  }

  const panelResult = await pool.query(
    `SELECT panels.*, vendors.upi_id, vendors.payee_name, vendors.name AS vendor_name
     FROM panels JOIN vendors ON vendors.id = panels.vendor_id
     WHERE panels.id = $1`,
    [panelId]
  );
  const panel = panelResult.rows[0];
  if (!panel) return res.status(404).json({ error: 'Panel not found' });

  const subtotal = Number(panel.price) * Number(quantity);
  const totalAmount = subtotal + PLATFORM_FEE;

  const orderResult = await pool.query(
    `INSERT INTO panel_orders (panel_id, buyer_id, quantity, platform_fee, total_amount)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [panelId, req.user.id, quantity, PLATFORM_FEE, totalAmount]
  );
  const order = orderResult.rows[0];

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
    receipt: `panel_order_${order.id}`,
  });

  const updated = await pool.query(
    `UPDATE panel_orders SET razorpay_order_id = $1 WHERE id = $2 RETURNING *`,
    [razorpayOrder.id, order.id]
  );

  res.status(201).json({
    ...updated.rows[0],
    panel_name: panel.name,
    vendor_name: panel.vendor_name,
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
  });
}

export async function getMyPanelOrders(req, res) {
  const result = await pool.query(
    `SELECT panel_orders.*, panels.name AS panel_name, panels.wattage, panels.panel_type,
            vendors.name AS vendor_name
     FROM panel_orders
     JOIN panels ON panels.id = panel_orders.panel_id
     JOIN vendors ON vendors.id = panels.vendor_id
     WHERE panel_orders.buyer_id = $1
     ORDER BY panel_orders.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
}

export async function getPanelOrderById(req, res) {
  const result = await pool.query(
    `SELECT panel_orders.*, panels.name AS panel_name, panels.wattage, panels.panel_type,
            vendors.name AS vendor_name
     FROM panel_orders
     JOIN panels ON panels.id = panel_orders.panel_id
     JOIN vendors ON vendors.id = panels.vendor_id
     WHERE panel_orders.id = $1`,
    [req.params.id]
  );
  const order = result.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyer_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this order' });
  }
  res.json({ ...order, razorpay_key_id: process.env.RAZORPAY_KEY_ID });
}

export async function verifyPanelOrderPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing Razorpay payment fields' });
  }

  const result = await pool.query('SELECT * FROM panel_orders WHERE id = $1', [req.params.id]);
  const order = result.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyer_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this order' });
  }
  if (order.status !== 'pending') {
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
    `UPDATE panel_orders
     SET status = 'payment_claimed', razorpay_payment_id = $1, paid_claimed_at = now()
     WHERE id = $2 RETURNING *`,
    [razorpay_payment_id, req.params.id]
  );
  res.json(updated.rows[0]);
}
