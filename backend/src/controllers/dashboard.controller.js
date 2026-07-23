import { pool } from '../config/db.js';

export async function getSellerDashboard(req, res) {
  const historyResult = await pool.query(
    `SELECT requests.*, listings.location, listings.standard_price, users.name AS buyer_name
     FROM requests
     JOIN listings ON listings.id = requests.listing_id
     JOIN users ON users.id = requests.buyer_id
     WHERE listings.seller_id = $1 AND requests.status = 'accepted'
     ORDER BY requests.responded_at DESC`,
    [req.user.id]
  );

  const totals = historyResult.rows.reduce(
    (acc, r) => {
      acc.totalKwhSold += Number(r.kwh_requested);
      acc.totalEarnings += Number(r.kwh_requested) * Number(r.price_applied);
      return acc;
    },
    { totalKwhSold: 0, totalEarnings: 0 }
  );

  res.json({ ...totals, transactions: historyResult.rows });
}

export async function getBuyerDashboard(req, res) {
  const historyResult = await pool.query(
    `SELECT requests.*, listings.location, listings.standard_price, users.name AS seller_name
     FROM requests
     JOIN listings ON listings.id = requests.listing_id
     JOIN users ON users.id = listings.seller_id
     WHERE requests.buyer_id = $1 AND requests.status = 'accepted'
     ORDER BY requests.responded_at DESC`,
    [req.user.id]
  );

  const totals = historyResult.rows.reduce(
    (acc, r) => {
      const kwh = Number(r.kwh_requested);
      const priceApplied = Number(r.price_applied);
      const standardPrice = Number(r.standard_price);
      acc.totalKwhBought += kwh;
      acc.totalSpending += kwh * priceApplied;
      if (priceApplied < standardPrice) {
        acc.totalSavings += (standardPrice - priceApplied) * kwh;
      }
      return acc;
    },
    { totalKwhBought: 0, totalSpending: 0, totalSavings: 0 }
  );

  res.json({ ...totals, transactions: historyResult.rows });
}
