// Worked example from Web-Notes/Accounting_Formats_Worked_Example.pdf (M/s Joshi Traders, April 2026).
export const business = 'M/s Joshi Traders · April 2026 · All amounts in ₹';
export const closingStock = 18000;

export const transactions = [
  { date: 'Apr 01', text: 'Started business with cash', amount: 100000, dr: ['cash'], cr: ['capital'], drName: 'Cash A/c', crName: 'Capital A/c' },
  { date: 'Apr 03', text: 'Bought goods for cash', amount: 40000, dr: ['purchases', 'purchase'], cr: ['cash'], drName: 'Purchases A/c', crName: 'Cash A/c' },
  { date: 'Apr 05', text: 'Bought goods on credit from Ravi', amount: 20000, dr: ['purchases', 'purchase'], cr: ['ravi'], drName: 'Purchases A/c', crName: 'Ravi A/c' },
  { date: 'Apr 08', text: 'Sold goods for cash', amount: 50000, dr: ['cash'], cr: ['sales'], drName: 'Cash A/c', crName: 'Sales A/c' },
  { date: 'Apr 10', text: 'Sold goods on credit to Mohan', amount: 30000, dr: ['mohan'], cr: ['sales'], drName: 'Mohan A/c', crName: 'Sales A/c' },
  { date: 'Apr 12', text: 'Paid wages', amount: 3000, dr: ['wages'], cr: ['cash'], drName: 'Wages A/c', crName: 'Cash A/c' },
  { date: 'Apr 13', text: 'Paid carriage inward', amount: 1000, dr: ['carriageinward', 'carriage'], cr: ['cash'], drName: 'Carriage Inward A/c', crName: 'Cash A/c' },
  { date: 'Apr 15', text: 'Paid salary', amount: 5000, dr: ['salary', 'salaries'], cr: ['cash'], drName: 'Salary A/c', crName: 'Cash A/c' },
  { date: 'Apr 18', text: 'Paid rent', amount: 4000, dr: ['rent'], cr: ['cash'], drName: 'Rent A/c', crName: 'Cash A/c' },
  { date: 'Apr 20', text: 'Bought furniture for cash', amount: 15000, dr: ['furniture'], cr: ['cash'], drName: 'Furniture A/c', crName: 'Cash A/c' },
  { date: 'Apr 25', text: 'Received commission', amount: 2000, dr: ['cash'], cr: ['commissionreceived', 'commissionrecd', 'commission'], drName: 'Cash A/c', crName: 'Commission Received A/c' },
  { date: 'Apr 28', text: 'Withdrew cash for personal use', amount: 3000, dr: ['drawings', 'drawing'], cr: ['cash'], drName: 'Drawings A/c', crName: 'Cash A/c' },
];

const e = (label, keys, amt) => ({ label, keys, amt });

export const ledger = {
  title: 'Cash Account',
  dr: [e('Capital A/c', ['capital'], 100000), e('Sales A/c', ['sales'], 50000), e('Commission Recd. A/c', ['commissionreceived', 'commissionrecd', 'commission'], 2000)],
  cr: [
    e('Purchases A/c', ['purchases', 'purchase'], 40000),
    e('Wages A/c', ['wages'], 3000),
    e('Carriage Inward A/c', ['carriageinward', 'carriage'], 1000),
    e('Salary A/c', ['salary', 'salaries'], 5000),
    e('Rent A/c', ['rent'], 4000),
    e('Furniture A/c', ['furniture'], 15000),
    e('Drawings A/c', ['drawings', 'drawing'], 3000),
    e('Balance c/d', ['balancecd', 'balancecarrieddown', 'balance', 'closingbalance'], 81000),
  ],
  total: 152000,
};

export const trialBalance = {
  rows: [
    { name: 'Cash A/c', keys: ['cash'], side: 'dr', amt: 81000 },
    { name: 'Purchases A/c', keys: ['purchases'], side: 'dr', amt: 60000 },
    { name: 'Mohan (Debtor)', keys: ['mohan'], side: 'dr', amt: 30000 },
    { name: 'Furniture A/c', keys: ['furniture'], side: 'dr', amt: 15000 },
    { name: 'Salary A/c', keys: ['salary'], side: 'dr', amt: 5000 },
    { name: 'Rent A/c', keys: ['rent'], side: 'dr', amt: 4000 },
    { name: 'Wages A/c', keys: ['wages'], side: 'dr', amt: 3000 },
    { name: 'Drawings A/c', keys: ['drawings'], side: 'dr', amt: 3000 },
    { name: 'Carriage Inward A/c', keys: ['carriageinward'], side: 'dr', amt: 1000 },
    { name: 'Capital A/c', keys: ['capital'], side: 'cr', amt: 100000 },
    { name: 'Sales A/c', keys: ['sales'], side: 'cr', amt: 80000 },
    { name: 'Ravi (Creditor)', keys: ['ravi'], side: 'cr', amt: 20000 },
    { name: 'Commission Received A/c', keys: ['commissionreceived'], side: 'cr', amt: 2000 },
  ],
  total: 202000,
};

export const trading = {
  title: 'Trading Account (for the period ended 30 April 2026)',
  dr: [
    e('Purchases', ['purchases', 'purchase'], 60000),
    e('Wages', ['wages'], 3000),
    e('Carriage Inward', ['carriageinward', 'carriage'], 1000),
    e('Gross Profit c/d', ['grossprofit', 'grossprofitcd', 'grossprofitcarrieddown'], 34000),
  ],
  cr: [e('Sales', ['sales'], 80000), e('Closing Stock', ['closingstock'], 18000)],
  total: 98000,
};

export const profitLoss = {
  title: 'Profit & Loss Account (for the period ended 30 April 2026)',
  dr: [
    e('Salary', ['salary', 'salaries'], 5000),
    e('Rent', ['rent'], 4000),
    e('Net Profit (transferred to Capital)', ['netprofit', 'netprofittransferredtocapital'], 27000),
  ],
  cr: [
    e('Gross Profit b/d', ['grossprofit', 'grossprofitbd', 'grossprofitbroughtdown'], 34000),
    e('Commission Received', ['commissionreceived', 'commissionrecd', 'commission'], 2000),
  ],
  total: 36000,
};

export const balanceSheet = {
  title: 'Balance Sheet (as on 30 April 2026)',
  dr: [
    e('Capital', ['capital'], 100000),
    e('Add: Net Profit', ['netprofit', 'addnetprofit'], 27000),
    e('Less: Drawings', ['drawings', 'lessdrawings'], 3000),
    e('Sundry Creditors (Ravi)', ['sundrycreditors', 'creditors', 'ravi'], 20000),
  ],
  cr: [
    e('Furniture', ['furniture'], 15000),
    e('Closing Stock', ['closingstock', 'stock'], 18000),
    e('Sundry Debtors (Mohan)', ['sundrydebtors', 'debtors', 'mohan'], 30000),
    e('Cash in Hand', ['cashinhand', 'cash'], 81000),
  ],
  total: 144000,
};
