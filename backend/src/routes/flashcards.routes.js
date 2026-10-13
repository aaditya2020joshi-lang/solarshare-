import { Router } from 'express';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const MAX_TEXT = 2000;
const MAX_BULK = 200;

const getSubject = db.prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?');
const listDecks = db.prepare(`
  SELECT s.id, s.name, COUNT(f.id) AS card_count
  FROM subjects s
  LEFT JOIN flashcards f ON f.subject_id = s.id
  WHERE s.user_id = ?
  GROUP BY s.id
  ORDER BY s.name ASC
`);
const listCards = db.prepare(
  'SELECT id, front, back, created_at FROM flashcards WHERE subject_id = ? AND user_id = ? ORDER BY id ASC'
);
const insertCard = db.prepare('INSERT INTO flashcards (subject_id, user_id, front, back) VALUES (?, ?, ?, ?)');
const getCard = db.prepare('SELECT id, front, back, created_at FROM flashcards WHERE id = ?');
const deleteCard = db.prepare('DELETE FROM flashcards WHERE id = ? AND user_id = ?');

function cleanCard(card) {
  const front = typeof card?.front === 'string' ? card.front.trim() : '';
  const back = typeof card?.back === 'string' ? card.back.trim() : '';
  if (!front || !back) return { error: 'Both the front and the back of a card are required.' };
  if (front.length > MAX_TEXT || back.length > MAX_TEXT) {
    return { error: `Each side of a card can be at most ${MAX_TEXT} characters.` };
  }
  return { front, back };
}

router.get(
  '/decks',
  asyncHandler(async (req, res) => {
    res.json({ decks: listDecks.all(req.userId) });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const subject = getSubject.get(req.query.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    res.json({ subject: { id: subject.id, name: subject.name }, cards: listCards.all(subject.id, req.userId) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const subject = getSubject.get(req.body.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const card = cleanCard(req.body);
    if (card.error) return res.status(400).json({ error: card.error });
    const result = insertCard.run(subject.id, req.userId, card.front, card.back);
    res.status(201).json({ card: getCard.get(result.lastInsertRowid) });
  })
);

router.post(
  '/bulk',
  asyncHandler(async (req, res) => {
    const subject = getSubject.get(req.body.subject_id, req.userId);
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
    db.transaction(() => {
      for (const c of cards) insertCard.run(subject.id, req.userId, c.front, c.back);
    })();
    res.status(201).json({ added: cards.length });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = deleteCard.run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Card not found.' });
    res.status(204).end();
  })
);

export default router;
