import { useMemo, useState } from 'react';
import data from '../data/accountingProblems.json';

const input =
  'w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const card =
  'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-5 shadow-sm';
const btn = 'text-sm font-semibold rounded-lg px-3 py-1.5 transition-colors';
const primary = `${btn} text-white bg-gradient-to-r from-brand-600 to-sky-accent shadow-sm hover:shadow-md`;
const ghost = `${btn} border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800`;
const ring = (ok) => (ok === true ? 'ring-2 ring-emerald-500' : ok === false ? 'ring-2 ring-red-500' : '');

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage may be blocked; practice still works
  }
}

function parseNum(s) {
  const t = String(s ?? '').replace(/[₹,\s]/g, '');
  if (t === '' || t === '–' || t === '-') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function normName(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/a\/c|a\.c\.|account/g, '')
    .replace(/\bdr\.?$/, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/^to(?=.{3})/, '');
}

function sameAccount(typed, expected) {
  const a = normName(typed);
  const b = normName(expected);
  if (!a || !b) return false;
  return a === b || (a.length >= 4 && b.includes(a)) || (b.length >= 4 && a.includes(b));
}

/* ---------- showing the PDF's question and solution blocks ---------- */

const isNumeric = (s) => /^[\s₹(),.\d–-]+$/.test(s) && /\d/.test(s);

function Table({ rows }) {
  const [head, ...body] = rows;
  const wide = head.length > 4;
  return (
    <div className="overflow-x-auto my-2">
      <table className={`${wide ? 'min-w-[40rem]' : 'w-full'} text-sm border-collapse`}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                className="text-left font-semibold text-xs text-gray-600 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 px-2 py-1"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, ri) => {
            const total = /^total/i.test(r.find((c) => c) || '');
            return (
              <tr key={ri} className={total ? 'font-semibold border-t border-gray-300 dark:border-gray-700' : ''}>
                {r.map((c, ci) => (
                  <td
                    key={ci}
                    className={`px-2 py-0.5 align-top text-gray-900 dark:text-gray-100 ${isNumeric(c) ? 'text-right tabular-nums' : ''}`}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Blocks({ blocks }) {
  return (
    <div className="text-sm text-gray-900 dark:text-gray-100">
      {blocks.map((b, i) =>
        b.t === 'p' ? (
          <p key={i} className="my-2 leading-relaxed">
            {b.text}
          </p>
        ) : b.rows.length === 0 ? null : b.rows[0].length === 2 && /^(\(\w+\)|\d+\.|[A-Z][a-z]{2}\s?\d+)$/.test(b.rows[0][0]) ? (
          <ul key={i} className="my-2 flex flex-col gap-1">
            {b.rows.map((r, k) => (
              <li key={k} className="flex gap-3">
                <span className="w-14 shrink-0 text-gray-500">{r[0]}</span>
                <span>{r[1]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Table key={i} rows={b.rows} />
        )
      )}
    </div>
  );
}

/* ---------- auto-checking for journal-style problems (Parts A and C) ---------- */

// Lines of the model journal: account name, and the amount on the debit or credit side.
function expectedLines(solution) {
  const table = solution.find((b) => b.t === 'table' && b.rows[0].some((h) => /Particulars/i.test(h)));
  if (!table) return null;
  const head = table.rows[0];
  const pi = head.findIndex((h) => /Particulars/i.test(h));
  const di = head.findIndex((h) => /Debit/i.test(h));
  const ci = head.findIndex((h) => /Credit/i.test(h));
  if (pi < 0 || di < 0 || ci < 0) return null;
  const lines = [];
  for (const r of table.rows.slice(1)) {
    const text = (r[pi] || '').trim();
    if (!text || text.startsWith('(') || /^total/i.test(text)) continue;
    const dr = parseNum(r[di]);
    const cr = parseNum(r[ci]);
    if (dr === null && cr === null) continue;
    lines.push({ name: text.replace(/\s*Dr\.?$/i, '').replace(/^To\s+/i, ''), dr, cr });
  }
  return lines.length ? lines : null;
}

function JournalChecker({ id, lines }) {
  const blank = () => Array.from({ length: Math.min(Math.max(lines.length, 4), 12) }, () => ({ name: '', dr: '', cr: '' }));
  const [rows, setRows] = useState(() => load(`accrows:${id}`, null) || blank());
  const [marks, setMarks] = useState(null);
  const [res, setRes] = useState(null);

  const set = (next) => {
    setRows(next);
    save(`accrows:${id}`, next);
    setMarks(null);
    setRes(null);
  };

  function check() {
    const used = new Set();
    const ok = rows.map(() => null);
    const missing = [];
    for (const e of lines) {
      const idx = rows.findIndex(
        (r, i) =>
          !used.has(i) &&
          sameAccount(r.name, e.name) &&
          (parseNum(r.dr) ?? null) === e.dr &&
          (parseNum(r.cr) ?? null) === e.cr
      );
      if (idx >= 0) {
        used.add(idx);
        ok[idx] = true;
      } else {
        missing.push(`${e.name} (${e.dr !== null ? 'Dr.' : 'Cr.'})`);
      }
    }
    rows.forEach((r, i) => {
      if (ok[i] === null && (r.name.trim() || r.dr.trim() || r.cr.trim())) ok[i] = false;
    });
    setMarks(ok);
    setRes({ score: used.size, total: lines.length, missing });
  }

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Your journal entries</div>
      <p className="text-xs text-gray-500 mb-2">
        Write one line for each account: the account name, and the amount in the Debit or the Credit column. The order of
        lines does not matter.
      </p>
      <div className="grid grid-cols-[1fr_6rem_6rem] gap-1.5 text-xs text-gray-500 mb-1">
        <span>Account</span>
        <span>Debit (₹)</span>
        <span>Credit (₹)</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_6rem_6rem] gap-1.5">
            {['name', 'dr', 'cr'].map((f) => (
              <input
                key={f}
                className={`${input} ${marks ? ring(marks[i]) : ''}`}
                value={r[f]}
                placeholder={f === 'name' ? 'e.g. Cash A/c' : ''}
                onChange={(e) => set(rows.map((x, k) => (k === i ? { ...x, [f]: e.target.value } : x)))}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <button type="button" className={primary} onClick={check}>
          Check my answer
        </button>
        <button type="button" className={ghost} onClick={() => set([...rows, { name: '', dr: '', cr: '' }])}>
          + Add row
        </button>
        <button type="button" className={ghost} onClick={() => set(blank())}>
          Clear
        </button>
      </div>
      {res && (
        <div
          className={`mt-3 rounded-xl px-3 py-2 text-sm ${
            res.score === res.total
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100'
          }`}
        >
          <div className="font-semibold">
            {res.score === res.total ? 'Perfect — all lines correct!' : `You got ${res.score} of ${res.total} lines correct.`}
          </div>
          {res.missing.length > 0 && <div>Missing or wrong: {res.missing.join('; ')}</div>}
        </div>
      )}
    </div>
  );
}

function AnswerPad({ id }) {
  const [text, setText] = useState(() => load(`accpad:${id}`, ''));
  return (
    <div className="mt-4">
      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Your working</div>
      <p className="text-xs text-gray-500 mb-2">
        Write or type your answer here (it is saved on this device), then press “Show solution” and compare.
      </p>
      <textarea
        rows={8}
        className={`${input} font-mono`}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          save(`accpad:${id}`, e.target.value);
        }}
      />
    </div>
  );
}

/* ---------- Parts A–E ---------- */

function ProblemView({ problem, done, setDone }) {
  const [show, setShow] = useState(false);
  const lines = useMemo(() => (/^[AC]/.test(problem.id) ? expectedLines(problem.solution) : null), [problem]);
  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Problem {problem.id}</h3>
        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 shrink-0">
          <input type="checkbox" checked={!!done} onChange={(e) => setDone(e.target.checked)} />
          Done
        </label>
      </div>
      <Blocks blocks={problem.question} />
      {lines ? <JournalChecker key={problem.id} id={problem.id} lines={lines} /> : <AnswerPad key={problem.id} id={problem.id} />}
      <div className="mt-4">
        <button type="button" className={ghost} onClick={() => setShow(!show)}>
          {show ? 'Hide solution' : 'Show solution'}
        </button>
      </div>
      {show && (
        <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
          <div className="text-xs font-semibold text-gray-500 mb-1">Solution {problem.id}</div>
          <Blocks blocks={problem.solution} />
        </div>
      )}
    </div>
  );
}

function Problems() {
  const [partId, setPartId] = useState('A');
  const [openId, setOpenId] = useState('A1');
  const [done, setDoneState] = useState(() => load('accdone', {}));
  const part = data.parts.find((p) => p.id === partId);
  const problem = part.problems.find((p) => p.id === openId) || part.problems[0];

  const setDone = (id, v) => {
    const next = { ...done, [id]: v };
    setDoneState(next);
    save('accdone', next);
  };
  const doneCount = (p) => p.problems.filter((x) => done[x.id]).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {data.parts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setPartId(p.id);
              setOpenId(p.problems[0].id);
            }}
            className={`text-xs font-medium rounded-full px-3 py-1.5 border ${
              p.id === partId
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200'
            }`}
          >
            Part {p.id}: {p.title} · {doneCount(p)}/{p.problems.length}
          </button>
        ))}
      </div>
      {part.intro.length > 0 && (
        <div className={card}>
          <Blocks blocks={part.intro} />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {part.problems.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpenId(p.id)}
            className={`text-sm rounded-lg px-3 py-1 border ${
              p.id === problem.id
                ? 'border-brand-600 text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 font-semibold'
                : 'border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200'
            }`}
          >
            {p.id}
            {done[p.id] ? ' ✓' : ''}
          </button>
        ))}
      </div>
      <ProblemView key={problem.id} problem={problem} done={done[problem.id]} setDone={(v) => setDone(problem.id, v)} />
    </div>
  );
}

/* ---------- Part F: 5-mark questions ---------- */

function QuestionF({ q }) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [text, setText] = useState(() => load(`accpad:${q.id}`, ''));
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 p-3">
      <button type="button" className="w-full text-left" onClick={() => setOpen(!open)}>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{q.id}.</span>{' '}
        <span className="text-sm text-gray-900 dark:text-gray-100">{q.question}</span>
      </button>
      {open && (
        <div className="mt-3">
          <textarea
            rows={6}
            className={input}
            placeholder="Write your answer here (saved on this device)"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              save(`accpad:${q.id}`, e.target.value);
            }}
          />
          <div className="mt-2">
            <button type="button" className={ghost} onClick={() => setShow(!show)}>
              {show ? 'Hide model answer' : 'Show model answer'}
            </button>
          </div>
          {show && (
            <div className="mt-2 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
              <Blocks blocks={q.answer} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FiveMarkQuestions() {
  return (
    <div className="flex flex-col gap-5">
      {data.partF.intro.length > 0 && <p className="text-sm text-gray-500">{data.partF.intro[0]}</p>}
      {data.partF.units.map((u) => (
        <section key={u.unit}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Unit {u.unit}: {u.title}
          </h3>
          <div className="flex flex-col gap-2">
            {u.questions.map((q) => (
              <QuestionF key={q.id} q={q} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export { Problems, FiveMarkQuestions };
