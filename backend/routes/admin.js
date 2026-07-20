const express = require('express');
const {
  getAdminDashboard,
  createAdminAction,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/', getAdminDashboard);
router.post('/', createAdminAction);

module.exports = router;
