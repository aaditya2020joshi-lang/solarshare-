import { useState } from 'react';
import {
  business,
  closingStock,
  transactions,
  ledger,
  trialBalance,
  trading,
  profitLoss,
  balanceSheet,
} from '../data/accountingFormats';

const input =
  'w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const card =
  'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-5 shadow-sm';
const btn = 'text-sm font-semibold rounded-lg px-3 py-1.5 transition-colors';
const primary = `${btn} text-white bg-gradient-to-r from-brand-600 to-sky-accent shadow-sm hover:shadow-md`;
const ghost = `${btn} border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800`;

const inr = (n) => Number(n).toLocaleString('en-IN');

function parseNum(s) {
  const t = String(s ?? '').replace(/[₹,\s]/g, '');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function norm(s) {
  let t = String(s ?? '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/a\/c|a\.c\.|account/g, '')
    .replace(/[^a-z0-9]/g, '');
  t = t.replace(/^(to|by)(?=.{3})/, '');
  return t;
}

const keyMatch = (name, keys) => {
  const n = norm(name);
  return n !== '' && keys.includes(n);
};

// Match what the student typed against the expected entries, in any order.
function matchSide(expected, rows) {
  const used = new Set();
  const ok = rows.map(() => null);
  const missing = [];
  for (const exp of expected) {
    const idx = rows.findIndex((r, i) => !used.has(i) && parseNum(r.amt) === exp.amt && keyMatch(r.name, exp.keys));
    if (idx >= 0) {
      used.add(idx);
      ok[idx] = true;
    } else {
      missing.push(exp.label);
    }
  }
  rows.forEach((r, i) => {
    if (ok[i] === null && (r.name.trim() || r.amt.trim())) ok[i] = false;
  });
  return { ok, missing, matched: used.size, expected: expected.length };
}

function Verdict({ result }) {
  if (!result) return null;
  const good = result.score === result.total;
  return (
    <div
      className={`mt-3 rounded-xl px-3 py-2 text-sm ${
        good
          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100'
      }`}
    >
      <div className="font-semibold">
        {good ? 'Perfect — all correct!' : `You got ${result.score} of ${result.total} correct.`}
      </div>
      {result.notes.map((n, i) => (
        <div key={i}>{n}</div>
      ))}
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className={`${card} scroll-mt-24`}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Controls({ onCheck, onReset, showAnswer, setShowAnswer }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <button type="button" className={primary} onClick={onCheck}>
        Check my answer
      </button>
      <button type="button" className={ghost} onClick={onReset}>
        Clear
      </button>
      <button type="button" className={ghost} onClick={() => setShowAnswer(!showAnswer)}>
        {showAnswer ? 'Hide worked example' : 'Show worked example'}
      </button>
    </div>
  );
}

const cellState = (ok) => (ok === true ? 'ring-2 ring-emerald-500' : ok === false ? 'ring-2 ring-red-500' : '');

/* ---------- Journal ---------- */

function Journal() {
  const empty = () => transactions.map(() => ({ dr: '', cr: '', amt: '' }));
  const [rows, setRows] = useState(empty);
  const [res, setRes] = useState(null);
  const [marks, setMarks] = useState(null);
  const [show, setShow] = useState(false);

  function check() {
    let score = 0;
    const m = rows.map((r, i) => {
      const t = transactions[i];
      const dr = keyMatch(r.dr, t.dr);
      const cr = keyMatch(r.cr, t.cr);
      const amt = parseNum(r.amt) === t.amount;
      if (dr && cr && amt) score += 1;
      return { dr, cr, amt };
    });
    setMarks(m);
    const wrong = m.map((x, i) => (x.dr && x.cr && x.amt ? null : i + 1)).filter(Boolean);
    setRes({ score, total: transactions.length, notes: wrong.length ? [`Check entries: ${wrong.join(', ')}`] : [] });
  }

  return (
    <Section id="journal" title="1. Journal Entries">
      <p className="text-sm text-gray-500 mb-3">
        For each transaction write the account to debit, the account to credit and the amount.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="py-1 pr-2">#</th>
              <th className="pr-2">Date</th>
              <th className="pr-2">Transaction</th>
              <th className="pr-2 min-w-[9rem]">Debit account</th>
              <th className="pr-2 min-w-[9rem]">Credit account</th>
              <th className="min-w-[6rem]">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="align-top">
                <td className="py-1 pr-2 text-gray-500">{i + 1}</td>
                <td className="pr-2 whitespace-nowrap text-gray-600 dark:text-gray-300">{t.date}</td>
                <td className="pr-2 text-gray-900 dark:text-white">
                  {t.text} ₹{inr(t.amount)}
                </td>
                {['dr', 'cr', 'amt'].map((f) => (
                  <td key={f} className="pr-2 py-1">
                    <input
                      className={`${input} ${marks ? cellState(marks[i][f]) : ''}`}
                      value={rows[i][f]}
                      placeholder={f === 'dr' ? 'e.g. Cash A/c' : f === 'cr' ? 'e.g. Capital A/c' : '0'}
                      onChange={(e) => {
                        setRows(rows.map((r, k) => (k === i ? { ...r, [f]: e.target.value } : r)));
                        setMarks(null);
                        setRes(null);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Verdict result={res} />
      <Controls
        onCheck={check}
        onReset={() => {
          setRows(empty());
          setMarks(null);
          setRes(null);
        }}
        showAnswer={show}
        setShowAnswer={setShow}
      />
      {show && (
        <ol className="mt-3 text-sm space-y-1 text-gray-800 dark:text-gray-200 list-decimal pl-5">
          {transactions.map((t, i) => (
            <li key={i}>
              {t.drName} Dr. ₹{inr(t.amount)} · To {t.crName} ₹{inr(t.amount)}
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

/* ---------- Two-sided formats (ledger, trading, P&L, balance sheet) ---------- */

function SideEditor({ rows, setRows, marks, heading, onChange }) {
  const update = (i, field, value) => {
    setRows(rows.map((x, k) => (k === i ? { ...x, [field]: value } : x)));
    onChange();
  };
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-1">{heading}</div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_6rem] gap-1.5">
            <input
              className={`${input} ${marks ? cellState(marks[i]) : ''}`}
              value={r.name}
              placeholder="Particulars"
              onChange={(e) => update(i, 'name', e.target.value)}
            />
            <input
              className={`${input} ${marks ? cellState(marks[i]) : ''}`}
              value={r.amt}
              placeholder="₹"
              onChange={(e) => update(i, 'amt', e.target.value)}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline"
        onClick={() => setRows([...rows, { name: '', amt: '' }])}
      >
        + Add row
      </button>
    </div>
  );
}

function TotalRow({ value, setValue, state, onChange }) {
  return (
    <div className="grid grid-cols-[1fr_6rem] gap-1.5 mt-2">
      <div className="text-sm font-semibold text-right pr-2 pt-1 text-gray-700 dark:text-gray-200">Total</div>
      <input
        className={`${input} ${state === undefined ? '' : cellState(state)}`}
        value={value}
        placeholder="₹"
        onChange={(e) => {
          setValue(e.target.value);
          onChange();
        }}
      />
    </div>
  );
}

function TwoSided({ id, title, data, left, right, hint }) {
  const blank = (n) => Array.from({ length: n }, () => ({ name: '', amt: '' }));
  const [l, setL] = useState(() => blank(data.dr.length + 1));
  const [r, setR] = useState(() => blank(data.cr.length + 1));
  const [tl, setTl] = useState('');
  const [tr, setTr] = useState('');
  const [mk, setMk] = useState(null);
  const [res, setRes] = useState(null);
  const [show, setShow] = useState(false);

  const dirty = () => {
    setMk(null);
    setRes(null);
  };

  function check() {
    const a = matchSide(data.dr, l);
    const b = matchSide(data.cr, r);
    const totalOkL = parseNum(tl) === data.total;
    const totalOkR = parseNum(tr) === data.total;
    const score = a.matched + b.matched + (totalOkL ? 1 : 0) + (totalOkR ? 1 : 0);
    const total = a.expected + b.expected + 2;
    const notes = [];
    if (a.missing.length) notes.push(`${left}: missing or wrong → ${a.missing.join(', ')}`);
    if (b.missing.length) notes.push(`${right}: missing or wrong → ${b.missing.join(', ')}`);
    if (!totalOkL || !totalOkR) notes.push('Check the totals of both sides — they must be equal.');
    setMk({ l: a.ok, r: b.ok, tl: totalOkL, tr: totalOkR });
    setRes({ score, total, notes });
  }

  return (
    <Section id={id} title={title}>
      <p className="text-sm text-gray-500 mb-3">
        {data.title}. Fill in the {left} and {right} sides, then the totals. {hint}
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <SideEditor rows={l} setRows={setL} marks={mk?.l} heading={left} onChange={dirty} />
          <TotalRow value={tl} setValue={setTl} state={mk?.tl} onChange={dirty} />
        </div>
        <div>
          <SideEditor rows={r} setRows={setR} marks={mk?.r} heading={right} onChange={dirty} />
          <TotalRow value={tr} setValue={setTr} state={mk?.tr} onChange={dirty} />
        </div>
      </div>
      <Verdict result={res} />
      <Controls
        onCheck={check}
        onReset={() => {
          setL(blank(data.dr.length + 1));
          setR(blank(data.cr.length + 1));
          setTl('');
          setTr('');
          dirty();
        }}
        showAnswer={show}
        setShowAnswer={setShow}
      />
      {show && (
        <div className="mt-3 grid md:grid-cols-2 gap-4 text-sm">
          {[
            [left, data.dr],
            [right, data.cr],
          ].map(([h, list]) => (
            <div key={h} className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
              <div className="text-xs font-semibold text-gray-500 mb-1">{h}</div>
              {list.map((x) => (
                <div key={x.label} className="flex justify-between text-gray-900 dark:text-white">
                  <span>{x.label}</span>
                  <span className="tabular-nums">{inr(x.amt)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t border-gray-200 dark:border-gray-800 mt-1 pt-1 text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="tabular-nums">{inr(data.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ---------- Trial balance ---------- */

function TrialBalance() {
  const empty = () => trialBalance.rows.map(() => ({ dr: '', cr: '' }));
  const [rows, setRows] = useState(empty);
  const [tdr, setTdr] = useState('');
  const [tcr, setTcr] = useState('');
  const [mk, setMk] = useState(null);
  const [res, setRes] = useState(null);
  const [show, setShow] = useState(false);

  const touch = () => {
    setMk(null);
    setRes(null);
  };

  function check() {
    let score = 0;
    const m = rows.map((r, i) => {
      const t = trialBalance.rows[i];
      const dr = parseNum(r.dr);
      const cr = parseNum(r.cr);
      const good = t.side === 'dr' ? dr === t.amt && cr === null : cr === t.amt && dr === null;
      if (good) score += 1;
      return r.dr.trim() || r.cr.trim() ? good : false;
    });
    const t1 = parseNum(tdr) === trialBalance.total;
    const t2 = parseNum(tcr) === trialBalance.total;
    setMk({ m, t1, t2 });
    const wrong = m.map((x, i) => (x ? null : trialBalance.rows[i].name)).filter(Boolean);
    const notes = [];
    if (wrong.length) notes.push(`Check: ${wrong.join(', ')}`);
    if (!t1 || !t2) notes.push('Check the totals — debit and credit totals must agree.');
    setRes({ score: score + (t1 ? 1 : 0) + (t2 ? 1 : 0), total: trialBalance.rows.length + 2, notes });
  }

  return (
    <Section id="tb" title="3. Trial Balance (as on 30 April 2026)">
      <p className="text-sm text-gray-500 mb-3">
        Put each balance in the correct column — debit or credit — then total both columns.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="py-1 pr-2">#</th>
              <th className="pr-2">Name of Account</th>
              <th className="pr-2 w-32">Debit (₹)</th>
              <th className="w-32">Credit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {trialBalance.rows.map((t, i) => (
              <tr key={i}>
                <td className="py-1 pr-2 text-gray-500">{i + 1}</td>
                <td className="pr-2 text-gray-900 dark:text-white">{t.name}</td>
                {['dr', 'cr'].map((f) => (
                  <td key={f} className="pr-2 py-1">
                    <input
                      className={`${input} ${mk ? cellState(mk.m[i]) : ''}`}
                      value={rows[i][f]}
                      onChange={(e) => {
                        setRows(rows.map((r, k) => (k === i ? { ...r, [f]: e.target.value } : r)));
                        touch();
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td />
              <td className="pr-2 font-semibold text-gray-900 dark:text-white">Total</td>
              <td className="pr-2 py-1">
                <input
                  className={`${input} ${mk ? cellState(mk.t1) : ''}`}
                  value={tdr}
                  onChange={(e) => {
                    setTdr(e.target.value);
                    touch();
                  }}
                />
              </td>
              <td className="py-1">
                <input
                  className={`${input} ${mk ? cellState(mk.t2) : ''}`}
                  value={tcr}
                  onChange={(e) => {
                    setTcr(e.target.value);
                    touch();
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Verdict result={res} />
      <Controls
        onCheck={check}
        onReset={() => {
          setRows(empty());
          setTdr('');
          setTcr('');
          touch();
        }}
        showAnswer={show}
        setShowAnswer={setShow}
      />
      {show && (
        <table className="mt-3 w-full text-sm">
          <tbody>
            {trialBalance.rows.map((t) => (
              <tr key={t.name} className="text-gray-900 dark:text-white">
                <td>{t.name}</td>
                <td className="text-right tabular-nums w-28">{t.side === 'dr' ? inr(t.amt) : ''}</td>
                <td className="text-right tabular-nums w-28">{t.side === 'cr' ? inr(t.amt) : ''}</td>
              </tr>
            ))}
            <tr className="font-semibold border-t border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
              <td>Total</td>
              <td className="text-right tabular-nums">{inr(trialBalance.total)}</td>
              <td className="text-right tabular-nums">{inr(trialBalance.total)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </Section>
  );
}

const PILLS = [
  ['journal', '1. Journal'],
  ['ledger', '2. Ledger'],
  ['tb', '3. Trial Balance'],
  ['trading', '4. Trading A/c'],
  ['pl', '5. Profit & Loss A/c'],
  ['bs', '6. Balance Sheet'],
];

export default function Accounts() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">Accounts</h1>
      <p className="text-sm text-gray-500 mb-4">
        Practise the accounting formats — Final Accounts with a worked example. Fill in each format, press “Check my
        answer”, and see what is right or wrong.
      </p>

      <div className="flex flex-wrap gap-2 mb-6 sticky top-16 z-20 py-2">
        {PILLS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="text-xs font-medium rounded-full px-3 py-1 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:border-brand-500"
          >
            {label}
          </a>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <section className={card}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Transactions</h2>
          <p className="text-xs text-gray-500 mb-3">{business}</p>
          <ul className="text-sm grid sm:grid-cols-2 gap-x-6 gap-y-1 text-gray-800 dark:text-gray-200">
            {transactions.map((t, i) => (
              <li key={i}>
                <span className="text-gray-500">
                  {i + 1}. {t.date}
                </span>{' '}
                {t.text} ₹{inr(t.amount)}
              </li>
            ))}
          </ul>
          <p className="text-sm mt-3 font-medium text-gray-900 dark:text-white">Closing stock: ₹{inr(closingStock)}</p>
        </section>

        <Journal />
        <TwoSided
          id="ledger"
          title="2. Ledger – Cash Account"
          data={ledger}
          left="Dr. (Receipts)"
          right="Cr. (Payments)"
          hint="Use “Balance c/d” on the credit side."
        />
        <TrialBalance />
        <TwoSided
          id="trading"
          title="4. Trading Account"
          data={trading}
          left="Dr. Particulars"
          right="Cr. Particulars"
          hint="Use the closing stock given above."
        />
        <TwoSided
          id="pl"
          title="5. Profit & Loss Account"
          data={profitLoss}
          left="Dr. Particulars"
          right="Cr. Particulars"
          hint="Bring down the gross profit from the Trading Account."
        />
        <TwoSided
          id="bs"
          title="6. Balance Sheet"
          data={balanceSheet}
          left="Liabilities"
          right="Assets"
          hint="Show Capital, add net profit and less drawings as separate lines."
        />
      </div>
    </div>
  );
}
