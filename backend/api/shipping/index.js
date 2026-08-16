const express = require('express');
const router = express.Router();

router.get('/methods', (req, res) => {
  res.json([
    { name: "Paczkomat", price: 12.99 },
    { name: "Kurier", price: 17.99 },
    { name: "Odbiór osobisty", price: 0 }
  ]);
});

module.exports = router;
