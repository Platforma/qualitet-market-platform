'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { parsePagination } = require('../helpers/pagination');

async function listOrders(req, res) {
  const { page, limit, offset } = parsePagination(req);

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM orders');
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await db.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return res.json({ total, page, limit, orders: result.rows });
  } catch (err) {
    console.error('orders list error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
}

async function createOrder(req, res) {
  const { store_id, shipping_address = '', total = 0 } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO orders
         (id, store_id, status, shipping_address, total, created_at)
       VALUES ($1, $2, 'created', $3, $4, NOW())
       RETURNING *`,
      [uuidv4(), store_id, shipping_address, total]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('orders create error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
}

module.exports = {
  listOrders,
  createOrder,
};
