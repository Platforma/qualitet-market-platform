const express = require('express');
const router = express.Router();
const pool = require('../../db/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: "OK", time: result.rows[0].now });
  } catch (err) {
    res.json({ status: "ERROR", message: err.message });
  }
});

module.exports = router;
