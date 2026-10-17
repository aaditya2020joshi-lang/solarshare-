import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { TrashIcon } from '../components/icons';

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';

const buttonClass =
  'bg-gradient-to-r from-brand-600 to-sky-accent text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60';

// Notes are plain text: "•" bullets, "–" sub-bullets, and [TABLE] ... [/TABLE] blocks with " | " between cells.
function NoteBody({ content }) {
  const blocks = [];
  let table = null;
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (t === '[TABLE]') {
      table = [];
    } else if (t === '[/TABLE]') {
      if (table) blocks.push({ type: 'table', rows: table });
      table = null;
    } else if (table) {
      if (t) table.push(t.split(' | '));
    } else if (t) {
      blocks.push({ type: t.startsWith('–') ? 'sub' : t.startsWith('•') ? 'bullet' : 'text', text: t.replace(/^[•–]\s*/, '') });
    }
  }
  if (table) blocks.push({ type: 'table', rows: table });

  return (
    <div className="text-sm text-gray-800 dark:text-gray-200 flex flex-col gap-1.5">
      {blocks.map((b, i) => {
        if (b.type === 'table') {
          const [head, ...body] = b.rows;
          return (
            <div key={i} className="overflow-x-auto my-2">
              <table className="min-w-full text-left border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    {head.map((c, j) => (
                      <th key={j} className="px-3 py-2 font-semibold border-b border-gray-200 dark:border-gray-700">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, r) => (
                    <tr key={r} className="border-t border-gray-200 dark:border-gray-700 align-top">
                      {row.map((c, j) => (
                        <td key={j} className="px-3 py-2">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (b.type === 'bullet') {
          return (
            <p key={i} className="pl-4 -indent-4">
              • {b.text}
            </p>
          );
        }
        if (b.type === 'sub') {
          return (
            <p key={i} className="pl-8 -indent-4 text-gray-600 dark:text-gray-400">
              – {b.text}
            </p>
          );
        }
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}

function TestLinks({ tests }) {
  if (tests.length === 0) return null;
  return (
    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Test yourself on this unit</div>
      <div className="flex flex-wrap gap-2">
        {tests.map((t) => (
          <Link
            key={t.id}
            to={`/tests/${t.id}/take`}
            className="text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-sky-accent px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            {t.title.split('–').pop().trim()} · {t.question_count} Qs
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function NotesSubject() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openId, setOpenId] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [group, setGroup] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [addError, setAddError] = useState('');

  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  function load() {
    return client
      .get('/notes', { params: { subject_id: subjectId } })
      .then((res) => {
        setSubject(res.data.subject);
        setNotes(res.data.notes);
      })
      .catch(() => setNotFound(true));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    // Tests are optional here: they only power the "take a test" buttons under each note.
    client
      .get(`/subjects/${subjectId}`)
      .then((res) => setTests(res.data.tests))
      .catch(() => setTests([]));
  }, [subjectId]);

  // A note in "Unit 3: ..." links to the tests titled "Unit 3: ...".
  function testsForNote(note) {
    const unit = (note.group_name || '').split(':')[0].trim();
    if (!unit) return [];
    return tests
      .filter((t) => t.title.startsWith(`${unit}:`))
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAddError('');
    try {
      await client.post('/notes', { subject_id: Number(subjectId), group_name: group, title, content });
      setTitle('');
      setContent('');
      setShowAdd(false);
      await load();
    } catch (err) {
      setAddError(err.response?.data?.error || 'Could not add the note.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return;
    await client.delete(`/notes/${id}`);
    load();
  }

  async function fillSample() {
    setImportError('');
    try {
      const res = await fetch('/sample-notes/economics-notes.json');
      setImportText(await res.text());
    } catch {
      setImportError('Could not load the Economics notes.');
    }
  }

  async function handleImport(e) {
    e.preventDefault();
    setImportError('');
    setImportMessage('');
    let data;
    try {
      data = JSON.parse(importText);
    } catch {
      setImportError('That is not valid JSON.');
      return;
    }
    setImporting(true);
    try {
      const res = await client.post('/notes/import', { subject_id: Number(subjectId), notes: data.notes });
      setImportMessage(`Imported ${res.data.created} notes. Skipped ${res.data.skipped} that already existed.`);
      setImportText('');
      await load();
    } catch (err) {
      setImportError(err.response?.data?.error || 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (notFound || !subject) {
    return <p className="text-center py-24 text-gray-500">Subject not found.</p>;
  }

  const groups = [];
  for (const n of notes) {
    const name = n.group_name || 'Notes';
    let g = groups.find((x) => x.name === name);
    if (!g) groups.push((g = { name, items: [] }));
    g.items.push(n);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/notes" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
        ← All notes
      </Link>
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-2 mb-6">{subject.name}</h1>

      {groups.length === 0 && <p className="text-sm text-gray-500 mb-6">No notes yet. Add one or import a set below.</p>}

      {groups.map((g) => (
        <section key={g.name} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{g.name}</h2>
          <ul className="flex flex-col gap-2">
            {g.items.map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center justify-between gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === n.id ? null : n.id)}
                    aria-expanded={openId === n.id}
                    className="flex-1 text-left font-medium text-gray-900 dark:text-white"
                  >
                    {n.title}
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    aria-label="Delete note"
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                  >
                    <TrashIcon />
                  </button>
                </div>
                {openId === n.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <NoteBody content={n.content} />
                    <TestLinks tests={testsForNote(n)} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="flex flex-col gap-3 mt-8">
        <div>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="text-sm font-medium text-brand-600 dark:text-brand-400"
          >
            {showAdd ? 'Hide add note' : 'Add a note'}
          </button>
          {showAdd && (
            <form onSubmit={handleAdd} className="mt-3 flex flex-col gap-2">
              <input
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Section (optional)"
                className={inputClass}
              />
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputClass} />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Write your note. Start lines with • for bullets."
                className={inputClass}
              />
              {addError && <p className="text-sm text-red-600">{addError}</p>}
              <button type="submit" disabled={!title.trim() || !content.trim()} className={`self-start ${buttonClass}`}>
                Save note
              </button>
            </form>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className="text-sm font-medium text-brand-600 dark:text-brand-400"
          >
            {showImport ? 'Hide import' : 'Import notes'}
          </button>
          {showImport && (
            <form onSubmit={handleImport} className="mt-3 flex flex-col gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paste notes JSON, or fill in the Economics notes and import them.
              </p>
              <button
                type="button"
                onClick={fillSample}
                className="self-start text-sm font-medium text-brand-600 dark:text-brand-400"
              >
                Fill with the Economics notes
              </button>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={6}
                className={`${inputClass} font-mono text-xs`}
              />
              {importError && <p className="text-sm text-red-600">{importError}</p>}
              {importMessage && <p className="text-sm text-green-600">{importMessage}</p>}
              <button type="submit" disabled={importing || !importText.trim()} className={`self-start ${buttonClass}`}>
                {importing ? 'Importing…' : 'Import'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
