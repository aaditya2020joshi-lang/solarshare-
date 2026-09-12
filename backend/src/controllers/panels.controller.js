import { pool } from '../config/db.js';

export async function getVendors(req, res) {
  const result = await pool.query('SELECT id, name, description, location FROM vendors ORDER BY name');
  res.json(result.rows);
}

export async function getPanels(req, res) {
  const { vendorId, maxPrice, panelType } = req.query;

  const conditions = [];
  const params = [];

  if (vendorId) {
    params.push(vendorId);
    conditions.push(`panels.vendor_id = $${params.length}`);
  }
  if (maxPrice) {
    params.push(maxPrice);
    conditions.push(`panels.price <= $${params.length}`);
  }
  if (panelType) {
    params.push(panelType);
    conditions.push(`panels.panel_type = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT panels.*, vendors.name AS vendor_name, vendors.location AS vendor_location
     FROM panels JOIN vendors ON vendors.id = panels.vendor_id
     ${where}
     ORDER BY panels.price ASC`,
    params
  );

  res.json(result.rows);
}

export async function getPanelById(req, res) {
  const result = await pool.query(
    `SELECT panels.*, vendors.name AS vendor_name, vendors.location AS vendor_location,
            vendors.description AS vendor_description
     FROM panels JOIN vendors ON vendors.id = panels.vendor_id
     WHERE panels.id = $1`,
    [req.params.id]
  );
  const panel = result.rows[0];
  if (!panel) return res.status(404).json({ error: 'Panel not found' });
  res.json(panel);
}
