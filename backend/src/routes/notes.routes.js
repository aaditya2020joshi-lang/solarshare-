import { Router } from 'express';
import { db } from '../config/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const MAX_NOTES = 200;
const MAX_CONTENT = 50000;

const getSubject = db.prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?');
const listDecks = db.prepare(`
  SELECT s.id, s.name, COUNT(n.id) AS note_count
  FROM subjects s
  LEFT JOIN notes n ON n.subject_id = s.id
  WHERE s.user_id = ?
  GROUP BY s.id
  ORDER BY s.name ASC
`);
const listNotes = db.prepare(
  'SELECT id, group_name, title, content, order_index FROM notes WHERE subject_id = ? AND user_id = ? ORDER BY order_index ASC, id ASC'
);
const maxOrder = db.prepare('SELECT COALESCE(MAX(order_index), 0) AS m FROM notes WHERE subject_id = ?');
const insertNote = db.prepare(
  'INSERT INTO notes (subject_id, user_id, group_name, title, content, order_index) VALUES (?, ?, ?, ?, ?, ?)'
);
const getNote = db.prepare('SELECT id, group_name, title, content, order_index FROM notes WHERE id = ?');
const existingTitles = db.prepare('SELECT title FROM notes WHERE subject_id = ? AND user_id = ?');
const deleteNote = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?');

function cleanNote(raw) {
  const title = typeof raw?.title === 'string' ? raw.title.trim() : '';
  const content = typeof raw?.content === 'string' ? raw.content.trim() : '';
  const group = typeof raw?.group_name === 'string' ? raw.group_name.trim().slice(0, 200) : '';
  if (!title || !content) return { error: 'Each note needs a title and some content.' };
  if (title.length > 300) return { error: 'A note title can be at most 300 characters.' };
  if (content.length > MAX_CONTENT) return { error: `A note can be at most ${MAX_CONTENT} characters.` };
  return { title, content, group_name: group };
}

router.get(
  '/decks',
  asyncHandler((req, res) => {
    res.json({ subjects: listDecks.all(req.userId) });
  })
);

router.get(
  '/',
  asyncHandler((req, res) => {
    const subject = getSubject.get(req.query.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    res.json({ subject: { id: subject.id, name: subject.name }, notes: listNotes.all(subject.id, req.userId) });
  })
);

router.post(
  '/',
  asyncHandler((req, res) => {
    const subject = getSubject.get(req.body.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const note = cleanNote(req.body);
    if (note.error) return res.status(400).json({ error: note.error });
    const order = maxOrder.get(subject.id).m + 1;
    const info = insertNote.run(subject.id, req.userId, note.group_name, note.title, note.content, order);
    res.status(201).json({ note: getNote.get(info.lastInsertRowid) });
  })
);

// Bulk import from JSON: { subject_id, notes: [{ group_name, title, content }] }. Skips titles that already exist.
router.post(
  '/import',
  asyncHandler((req, res) => {
    const subject = getSubject.get(req.body.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const list = req.body.notes;
    if (!Array.isArray(list) || list.length === 0) return res.status(400).json({ error: 'No notes provided.' });
    if (list.length > MAX_NOTES) {
      return res.status(400).json({ error: `You can import at most ${MAX_NOTES} notes at once.` });
    }

    const notes = [];
    for (const [i, raw] of list.entries()) {
      const note = cleanNote(raw);
      if (note.error) return res.status(400).json({ error: `Note ${i + 1}: ${note.error}` });
      notes.push(note);
    }

    let created = 0;
    let skipped = 0;
    db.transaction(() => {
      const titles = new Set(existingTitles.all(subject.id, req.userId).map((r) => r.title));
      let order = maxOrder.get(subject.id).m;
      for (const n of notes) {
        if (titles.has(n.title)) {
          skipped++;
          continue;
        }
        insertNote.run(subject.id, req.userId, n.group_name, n.title, n.content, ++order);
        titles.add(n.title);
        created++;
      }
    })();
    res.status(201).json({ created, skipped });
  })
);

router.delete(
  '/:id',
  asyncHandler((req, res) => {
    const info = deleteNote.run(req.params.id, req.userId);
    if (info.changes === 0) return res.status(404).json({ error: 'Note not found.' });
    res.status(204).end();
  })
);

export default router;
