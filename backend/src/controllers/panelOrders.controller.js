import crypto from 'crypto';
import Razorpay from 'razorpay';
import { pool } from '../config/db.js';

const PLATFORM_FEE = 49;
const EMI_MONTH_OPTIONS = [3, 6, 12];

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function buildInstallmentSchedule(totalAmount, months) {
  const base = Math.floor((totalAmount / months) * 100) / 100;
  const schedule = [];
  let allocated = 0;
  for (let i = 1; i <= months; i++) {
    const amount = i === months ? Number((totalAmount - allocated).toFixed(2)) : base;
    allocated += amount;
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + (i - 1));
    schedule.push({ installment_number: i, amount, due_date: dueDate.toISOString().slice(0, 10) });
  }
  return schedule;
}

export async function createPanelOrder(req, res) {
  const { panelId, quantity, paymentPlan, emiMonths } = req.body;
  if (!panelId || !quantity) {
    return res.status(400).json({ error: 'panelId and quantity are required' });
  }

  const isEmi = paymentPlan === 'emi';
  const months = isEmi ? Number(emiMonths) : null;
  if (isEmi && !EMI_MONTH_OPTIONS.includes(months)) {
    return res.status(400).json({ error: 'emiMonths must be 3, 6, or 12' });
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
    `INSERT INTO panel_orders (panel_id, buyer_id, quantity, platform_fee, total_amount, payment_plan, emi_months)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [panelId, req.user.id, quantity, PLATFORM_FEE, totalAmount, isEmi ? 'emi' : 'full', months]
  );
  const order = orderResult.rows[0];

  if (!isEmi) {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `panel_order_${order.id}`,
    });
    const updated = await pool.query(
      `UPDATE panel_orders SET razorpay_order_id = $1 WHERE id = $2 RETURNING *`,
      [razorpayOrder.id, order.id]
    );
    return res.status(201).json({
      ...updated.rows[0],
      panel_name: panel.name,
      vendor_name: panel.vendor_name,
      razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    });
  }

  const schedule = buildInstallmentSchedule(totalAmount, months);
  for (const inst of schedule) {
    await pool.query(
      `INSERT INTO emi_installments (panel_order_id, installment_number, amount, due_date)
       VALUES ($1, $2, $3, $4)`,
      [order.id, inst.installment_number, inst.amount, inst.due_date]
    );
  }

  const first = await pool.query(
    `SELECT * FROM emi_installments WHERE panel_order_id = $1 AND installment_number = 1`,
    [order.id]
  );
  const firstInstallment = first.rows[0];
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(Number(firstInstallment.amount) * 100),
    currency: 'INR',
    receipt: `panel_order_${order.id}_emi_1`,
  });
  const updatedInstallment = await pool.query(
    `UPDATE emi_installments SET razorpay_order_id = $1 WHERE id = $2 RETURNING *`,
    [razorpayOrder.id, firstInstallment.id]
  );

  res.status(201).json({
    ...order,
    panel_name: panel.name,
    vendor_name: panel.vendor_name,
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    installments: schedule.map((s, i) => (i === 0 ? updatedInstallment.rows[0] : { ...s, status: 'pending' })),
    current_installment: updatedInstallment.rows[0],
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

  const emiOrderIds = result.rows.filter((o) => o.payment_plan === 'emi').map((o) => o.id);
  let progressByOrder = {};
  if (emiOrderIds.length > 0) {
    const progress = await pool.query(
      `SELECT panel_order_id,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'paid')::int AS paid
       FROM emi_installments
       WHERE panel_order_id = ANY($1)
       GROUP BY panel_order_id`,
      [emiOrderIds]
    );
    progressByOrder = Object.fromEntries(progress.rows.map((r) => [r.panel_order_id, r]));
  }

  res.json(
    result.rows.map((o) => ({
      ...o,
      emi_progress: progressByOrder[o.id] || null,
    }))
  );
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

  if (order.payment_plan !== 'emi') {
    return res.json({ ...order, razorpay_key_id: process.env.RAZORPAY_KEY_ID });
  }

  const instResult = await pool.query(
    `SELECT * FROM emi_installments WHERE panel_order_id = $1 ORDER BY installment_number`,
    [order.id]
  );
  let installments = instResult.rows;
  let currentInstallment = installments.find((i) => i.status === 'pending') || null;

  if (currentInstallment && !currentInstallment.razorpay_order_id) {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(currentInstallment.amount) * 100),
      currency: 'INR',
      receipt: `panel_order_${order.id}_emi_${currentInstallment.installment_number}`,
    });
    const updated = await pool.query(
      `UPDATE emi_installments SET razorpay_order_id = $1 WHERE id = $2 RETURNING *`,
      [razorpayOrder.id, currentInstallment.id]
    );
    currentInstallment = updated.rows[0];
    installments = installments.map((i) => (i.id === currentInstallment.id ? currentInstallment : i));
  }

  res.json({
    ...order,
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    installments,
    current_installment: currentInstallment,
  });
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

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment signature verification failed' });
  }

  if (order.payment_plan !== 'emi') {
    if (order.status !== 'pending') {
      return res.status(409).json({ error: 'This order has already been paid' });
    }
    if (order.razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({ error: 'Order mismatch' });
    }
    const updated = await pool.query(
      `UPDATE panel_orders
       SET status = 'payment_claimed', razorpay_payment_id = $1, paid_claimed_at = now()
       WHERE id = $2 RETURNING *`,
      [razorpay_payment_id, req.params.id]
    );
    return res.json(updated.rows[0]);
  }

  const instResult = await pool.query(
    `SELECT * FROM emi_installments
     WHERE panel_order_id = $1 AND razorpay_order_id = $2 AND status = 'pending'`,
    [req.params.id, razorpay_order_id]
  );
  const installment = instResult.rows[0];
  if (!installment) {
    return res.status(409).json({ error: 'Installment not found or already paid' });
  }

  await pool.query(
    `UPDATE emi_installments SET status = 'paid', razorpay_payment_id = $1, paid_at = now() WHERE id = $2`,
    [razorpay_payment_id, installment.id]
  );

  const remaining = await pool.query(
    `SELECT COUNT(*)::int AS count FROM emi_installments WHERE panel_order_id = $1 AND status = 'pending'`,
    [req.params.id]
  );
  const allPaid = remaining.rows[0].count === 0;

  const updated = await pool.query(
    `UPDATE panel_orders
     SET status = $1, paid_claimed_at = CASE WHEN $1 = 'payment_claimed' THEN now() ELSE paid_claimed_at END
     WHERE id = $2 RETURNING *`,
    [allPaid ? 'payment_claimed' : 'emi_active', req.params.id]
  );

  res.json({ ...updated.rows[0], installment_paid: installment.installment_number, all_paid: allPaid });
}
