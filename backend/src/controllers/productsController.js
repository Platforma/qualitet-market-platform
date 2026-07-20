'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { parsePagination } = require('../helpers/pagination');

async function listProducts(req, res) {
  const { page, limit, offset } = parsePagination(req);

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM products');
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await db.query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return res.json({ total, page, limit, products: result.rows });
  } catch (err) {
    console.error('products list error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
}

async function createProduct(req, res) {
  const { store_id = null, name, price_net, tax_rate = 23, stock = 0 } = req.body;

  try {
    const priceGross = parseFloat(price_net) * (1 + parseFloat(tax_rate) / 100);
    const result = await db.query(
      `INSERT INTO products
         (id, store_id, name, price_net, tax_rate, price_gross, selling_price, stock, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7, 'active', NOW())
       RETURNING *`,
      [uuidv4(), store_id, name, price_net, tax_rate, priceGross.toFixed(2), stock]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('products create error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
}

module.exports = {
  listProducts,
  createProduct,
};
