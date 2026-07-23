import { pool } from '../config/db.js';

export async function createListing(req, res) {
  const { kwhAvailable, standardPrice, communityPrice, location, availableFrom, availableTo } = req.body;

  if (!kwhAvailable || !standardPrice || !location || !availableFrom || !availableTo) {
    return res.status(400).json({
      error: 'kwhAvailable, standardPrice, location, availableFrom, and availableTo are required',
    });
  }

  const result = await pool.query(
    `INSERT INTO listings (seller_id, kwh_available, standard_price, community_price, location, available_from, available_to)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [req.user.id, kwhAvailable, standardPrice, communityPrice || null, location, availableFrom, availableTo]
  );

  res.status(201).json(result.rows[0]);
}

export async function getListings(req, res) {
  const { location, maxPrice } = req.query;

  const conditions = ["status = 'active'", 'available_to >= now()'];
  const params = [];

  if (location) {
    params.push(`%${location}%`);
    conditions.push(`location ILIKE $${params.length}`);
  }
  if (maxPrice) {
    params.push(maxPrice);
    conditions.push(`standard_price <= $${params.length}`);
  }

  const result = await pool.query(
    `SELECT listings.*, users.name AS seller_name
     FROM listings
     JOIN users ON users.id = listings.seller_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC`,
    params
  );

  res.json(result.rows);
}

export async function getSellerListings(req, res) {
  const result = await pool.query(
    'SELECT * FROM listings WHERE seller_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(result.rows);
}

export async function getListingById(req, res) {
  const result = await pool.query(
    `SELECT listings.*, users.name AS seller_name
     FROM listings JOIN users ON users.id = listings.seller_id
     WHERE listings.id = $1`,
    [req.params.id]
  );
  const listing = result.rows[0];
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json(listing);
}

async function getOwnedListing(id, sellerId) {
  const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
  const listing = result.rows[0];
  if (!listing) return { error: { status: 404, message: 'Listing not found' } };
  if (listing.seller_id !== sellerId) {
    return { error: { status: 403, message: 'You do not own this listing' } };
  }
  return { listing };
}

export async function closeListing(req, res) {
  const { error } = await getOwnedListing(req.params.id, req.user.id);
  if (error) return res.status(error.status).json({ error: error.message });

  const result = await pool.query(
    "UPDATE listings SET status = 'closed' WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  res.json(result.rows[0]);
}

export async function deleteListing(req, res) {
  const { error } = await getOwnedListing(req.params.id, req.user.id);
  if (error) return res.status(error.status).json({ error: error.message });

  const requestCount = await pool.query(
    'SELECT COUNT(*)::int AS count FROM requests WHERE listing_id = $1',
    [req.params.id]
  );
  if (requestCount.rows[0].count > 0) {
    return res.status(409).json({
      error: 'This listing has requests attached to it. Close it instead of deleting.',
    });
  }

  await pool.query('DELETE FROM listings WHERE id = $1', [req.params.id]);
  res.status(204).send();
}
