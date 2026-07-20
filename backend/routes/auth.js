const express = require('express');
const {
  getAuthStatus,
  loginUser,
} = require('../controllers/authController');

const router = express.Router();

router.get('/', getAuthStatus);
router.post('/', loginUser);

module.exports = router;
