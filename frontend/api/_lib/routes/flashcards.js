import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

const MAX_TEXT = 2000;
const MAX_BULK = 200;

function cleanCard(card) {
  const front = typeof card?.front === 'string' ? card.front.trim() : '';
  const back = typeof card?.back === 'string' ? card.back.trim() : '';
  if (!front || !back) return { error: 'Both the front and the back of a card are required.' };
  if (front.length > MAX_TEXT || back.length > MAX_TEXT) {
    return { error: `Each side of a card can be at most ${MAX_TEXT} characters.` };
  }
  return { front, back };
}

async function getOwnedSubject(subjectId, userId) {
  const { rows } = await pool.query('SELECT * FROM subjects WHERE id = $1 AND user_id = $2', [subjectId, userId]);
  return rows[0];
}

router.get(
  '/decks',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT s.id, s.name, COUNT(f.id)::int AS card_count
       FROM subjects s
       LEFT JOIN flashcards f ON f.subject_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.name ASC`,
      [req.userId]
    );
    res.json({ decks: rows });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const subject = await getOwnedSubject(req.query.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const { rows } = await pool.query(
      'SELECT id, front, back, created_at FROM flashcards WHERE subject_id = $1 AND user_id = $2 ORDER BY id ASC',
      [subject.id, req.userId]
    );
    res.json({ subject: { id: subject.id, name: subject.name }, cards: rows });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const subject = await getOwnedSubject(req.body.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const card = cleanCard(req.body);
    if (card.error) return res.status(400).json({ error: card.error });
    const { rows } = await pool.query(
      'INSERT INTO flashcards (subject_id, user_id, front, back) VALUES ($1, $2, $3, $4) RETURNING id, front, back, created_at',
      [subject.id, req.userId, card.front, card.back]
    );
    res.status(201).json({ card: rows[0] });
  })
);

router.post(
  '/bulk',
  asyncHandler(async (req, res) => {
    const subject = await getOwnedSubject(req.body.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const list = req.body.cards;
    if (!Array.isArray(list) || list.length === 0) return res.status(400).json({ error: 'No cards provided.' });
    if (list.length > MAX_BULK) return res.status(400).json({ error: `You can add at most ${MAX_BULK} cards at once.` });

    const cards = [];
    for (const [i, raw] of list.entries()) {
      const card = cleanCard(raw);
      if (card.error) return res.status(400).json({ error: `Card ${i + 1}: ${card.error}` });
      cards.push(card);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const c of cards) {
        await client.query('INSERT INTO flashcards (subject_id, user_id, front, back) VALUES ($1, $2, $3, $4)', [
          subject.id,
          req.userId,
          c.front,
          c.back,
        ]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    res.status(201).json({ added: cards.length });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM flashcards WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    if (rowCount === 0) return res.status(404).json({ error: 'Card not found.' });
    res.status(204).end();
  })
);

export default router;
