const express = require('express');
const {
  getOrders,
  createOrder,
} = require('../controllers/ordersController');

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);

module.exports = router;
