import { pool } from '../config/db.js';

export async function createRequest(req, res) {
  const { listingId, kwhRequested } = req.body;

  if (!listingId || !kwhRequested) {
    return res.status(400).json({ error: 'listingId and kwhRequested are required' });
  }

  const listingResult = await pool.query(
    "SELECT * FROM listings WHERE id = $1 AND status = 'active'",
    [listingId]
  );
  const listing = listingResult.rows[0];
  if (!listing) return res.status(404).json({ error: 'Listing not found or no longer active' });
  if (Number(kwhRequested) > Number(listing.kwh_available)) {
    return res.status(400).json({ error: 'Requested kWh exceeds what is available' });
  }

  const buyerResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const buyer = buyerResult.rows[0];

  const isPriority = Boolean(buyer.community_priority);
  const priceApplied =
    isPriority && listing.community_price !== null ? listing.community_price : listing.standard_price;

  const result = await pool.query(
    `INSERT INTO requests (listing_id, buyer_id, kwh_requested, price_applied, is_priority)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [listingId, req.user.id, kwhRequested, priceApplied, isPriority]
  );

  res.status(201).json(result.rows[0]);
}

export async function getSellerRequests(req, res) {
  const result = await pool.query(
    `SELECT requests.*, listings.location, listings.kwh_available AS listing_kwh_available,
            users.name AS buyer_name
     FROM requests
     JOIN listings ON listings.id = requests.listing_id
     JOIN users ON users.id = requests.buyer_id
     WHERE listings.seller_id = $1
     ORDER BY requests.is_priority DESC, requests.created_at ASC`,
    [req.user.id]
  );
  res.json(result.rows);
}

export async function getBuyerRequests(req, res) {
  const result = await pool.query(
    `SELECT requests.*, listings.location, users.name AS seller_name
     FROM requests
     JOIN listings ON listings.id = requests.listing_id
     JOIN users ON users.id = listings.seller_id
     WHERE requests.buyer_id = $1
     ORDER BY requests.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
}

export async function respondToRequest(req, res) {
  const { decision } = req.body;
  if (!['accepted', 'declined'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be "accepted" or "declined"' });
  }

  const requestResult = await pool.query(
    `SELECT requests.*, listings.seller_id, listings.kwh_available
     FROM requests JOIN listings ON listings.id = requests.listing_id
     WHERE requests.id = $1`,
    [req.params.id]
  );
  const request = requestResult.rows[0];
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.seller_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not own the listing for this request' });
  }
  if (request.status !== 'pending') {
    return res.status(409).json({ error: 'This request has already been responded to' });
  }

  if (decision === 'accepted') {
    const remaining = Number(request.kwh_available) - Number(request.kwh_requested);
    await pool.query(
      `UPDATE listings SET kwh_available = $1, status = CASE WHEN $1::numeric <= 0 THEN 'closed' ELSE status END
       WHERE id = $2`,
      [remaining, request.listing_id]
    );
  }

  const updated = await pool.query(
    `UPDATE requests SET status = $1, responded_at = now() WHERE id = $2 RETURNING *`,
    [decision, req.params.id]
  );

  res.json(updated.rows[0]);
}

export async function cancelRequest(req, res) {
  const result = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
  const request = result.rows[0];
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.buyer_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this request' });
  }
  if (request.status !== 'pending') {
    return res.status(409).json({ error: 'Only pending requests can be cancelled' });
  }

  await pool.query('DELETE FROM requests WHERE id = $1', [req.params.id]);
  res.status(204).send();
}
