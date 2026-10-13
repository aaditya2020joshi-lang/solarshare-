import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

const MAX_NOTES = 200;
const MAX_CONTENT = 50000;

function cleanNote(raw) {
  const title = typeof raw?.title === 'string' ? raw.title.trim() : '';
  const content = typeof raw?.content === 'string' ? raw.content.trim() : '';
  const group = typeof raw?.group_name === 'string' ? raw.group_name.trim().slice(0, 200) : '';
  if (!title || !content) return { error: 'Each note needs a title and some content.' };
  if (title.length > 300) return { error: 'A note title can be at most 300 characters.' };
  if (content.length > MAX_CONTENT) return { error: `A note can be at most ${MAX_CONTENT} characters.` };
  return { title, content, group_name: group };
}

async function getOwnedSubject(subjectId, userId) {
  const { rows } = await pool.query('SELECT * FROM subjects WHERE id = $1 AND user_id = $2', [subjectId, userId]);
  return rows[0];
}

router.get(
  '/decks',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT s.id, s.name, COUNT(n.id)::int AS note_count
       FROM subjects s
       LEFT JOIN notes n ON n.subject_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.name ASC`,
      [req.userId]
    );
    res.json({ subjects: rows });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const subject = await getOwnedSubject(req.query.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const { rows } = await pool.query(
      'SELECT id, group_name, title, content, order_index FROM notes WHERE subject_id = $1 AND user_id = $2 ORDER BY order_index ASC, id ASC',
      [subject.id, req.userId]
    );
    res.json({ subject: { id: subject.id, name: subject.name }, notes: rows });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const subject = await getOwnedSubject(req.body.subject_id, req.userId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const note = cleanNote(req.body);
    if (note.error) return res.status(400).json({ error: note.error });
    const { rows } = await pool.query(
      `INSERT INTO notes (subject_id, user_id, group_name, title, content, order_index)
       VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM notes WHERE subject_id = $1))
       RETURNING id, group_name, title, content, order_index`,
      [subject.id, req.userId, note.group_name, note.title, note.content]
    );
    res.status(201).json({ note: rows[0] });
  })
);

// Bulk import from JSON: { subject_id, notes: [{ group_name, title, content }] }. Skips titles that already exist.
router.post(
  '/import',
  asyncHandler(async (req, res) => {
    const subject = await getOwnedSubject(req.body.subject_id, req.userId);
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

    const client = await pool.connect();
    let created = 0;
    let skipped = 0;
    try {
      await client.query('BEGIN');
      const existing = await client.query('SELECT title FROM notes WHERE subject_id = $1 AND user_id = $2', [
        subject.id,
        req.userId,
      ]);
      const titles = new Set(existing.rows.map((r) => r.title));
      const max = await client.query('SELECT COALESCE(MAX(order_index), 0) AS m FROM notes WHERE subject_id = $1', [
        subject.id,
      ]);
      let order = Number(max.rows[0].m);
      for (const n of notes) {
        if (titles.has(n.title)) {
          skipped++;
          continue;
        }
        order++;
        await client.query(
          'INSERT INTO notes (subject_id, user_id, group_name, title, content, order_index) VALUES ($1, $2, $3, $4, $5, $6)',
          [subject.id, req.userId, n.group_name, n.title, n.content, order]
        );
        titles.add(n.title);
        created++;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    res.status(201).json({ created, skipped });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.userId,
    ]);
    if (rowCount === 0) return res.status(404).json({ error: 'Note not found.' });
    res.status(204).end();
  })
);

export default router;
