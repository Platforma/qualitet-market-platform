const getAdminDashboard = (req, res) => {
  res.status(200).json({
    success: true,
    route: 'GET /api/admin',
    message: 'Admin dashboard data fetched',
    data: {
      totalUsers: 125,
      totalOrders: 42,
      totalProducts: 320,
    },
  });
};

const createAdminAction = (req, res) => {
  const { action } = req.body;

  res.status(201).json({
    success: true,
    route: 'POST /api/admin',
    message: 'Admin action executed (mock)',
    data: {
      action: action || 'no-action-provided',
      executedAt: new Date().toISOString(),
    },
  });
};

module.exports = {
  getAdminDashboard,
  createAdminAction,
};
