import { pool } from '../config/db.js';

async function getRequestParticipants(requestId) {
  const result = await pool.query(
    `SELECT requests.buyer_id, listings.seller_id
     FROM requests JOIN listings ON listings.id = requests.listing_id
     WHERE requests.id = $1`,
    [requestId]
  );
  return result.rows[0] || null;
}

function isParticipant(participants, userId) {
  return participants && (participants.buyer_id === userId || participants.seller_id === userId);
}

export async function getMessages(req, res) {
  const participants = await getRequestParticipants(req.params.id);
  if (!participants) return res.status(404).json({ error: 'Request not found' });
  if (!isParticipant(participants, req.user.id)) {
    return res.status(403).json({ error: 'You are not part of this conversation' });
  }

  const result = await pool.query(
    `SELECT messages.*, users.name AS sender_name
     FROM messages JOIN users ON users.id = messages.sender_id
     WHERE request_id = $1
     ORDER BY created_at ASC`,
    [req.params.id]
  );
  res.json(result.rows);
}

export async function sendMessage(req, res) {
  const { body } = req.body;
  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Message body is required' });
  }

  const participants = await getRequestParticipants(req.params.id);
  if (!participants) return res.status(404).json({ error: 'Request not found' });
  if (!isParticipant(participants, req.user.id)) {
    return res.status(403).json({ error: 'You are not part of this conversation' });
  }

  const result = await pool.query(
    `INSERT INTO messages (request_id, sender_id, body)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [req.params.id, req.user.id, body.trim()]
  );

  res.status(201).json({ ...result.rows[0], sender_name: req.user.name });
}
