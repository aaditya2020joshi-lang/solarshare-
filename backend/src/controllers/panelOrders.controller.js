import { pool } from '../config/db.js';

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

  const totalAmount = Number(panel.price) * Number(quantity);

  const orderResult = await pool.query(
    `INSERT INTO panel_orders (panel_id, buyer_id, quantity, total_amount)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [panelId, req.user.id, quantity, totalAmount]
  );

  res.status(201).json({
    ...orderResult.rows[0],
    panel_name: panel.name,
    vendor_name: panel.vendor_name,
    upi_id: panel.upi_id,
    payee_name: panel.payee_name,
  });
}

export async function getMyPanelOrders(req, res) {
  const result = await pool.query(
    `SELECT panel_orders.*, panels.name AS panel_name, panels.wattage, panels.panel_type,
            vendors.name AS vendor_name, vendors.upi_id, vendors.payee_name
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
            vendors.name AS vendor_name, vendors.upi_id, vendors.payee_name
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
  res.json(order);
}

export async function markPanelOrderPaid(req, res) {
  const result = await pool.query('SELECT * FROM panel_orders WHERE id = $1', [req.params.id]);
  const order = result.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyer_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this order' });
  }
  if (order.status !== 'pending') {
    return res.status(409).json({ error: 'This order has already been marked as paid' });
  }

  const updated = await pool.query(
    `UPDATE panel_orders SET status = 'payment_claimed', paid_claimed_at = now() WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  res.json(updated.rows[0]);
}
