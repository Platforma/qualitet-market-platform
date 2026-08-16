const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ payment: "OK" });
});

module.exports = router;
