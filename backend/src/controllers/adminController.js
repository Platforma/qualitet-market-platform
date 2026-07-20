'use strict';

const db = require('../config/database');

async function getDashboard(_req, res) {
  try {
    const [usersResult, productsResult, ordersResult] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM products'),
      db.query('SELECT COUNT(*) FROM orders'),
    ]);

    return res.json({
      users: parseInt(usersResult.rows[0].count, 10),
      products: parseInt(productsResult.rows[0].count, 10),
      orders: parseInt(ordersResult.rows[0].count, 10),
    });
  } catch (err) {
    console.error('admin dashboard error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
}

async function adminAction(req, res) {
  return res.status(200).json({
    status: 'ok',
    action: req.body.action || null,
  });
}

module.exports = {
  getDashboard,
  adminAction,
};
