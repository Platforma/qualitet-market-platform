const getAdminDashboard = (req, res) => {
  return res.status(501).json({
    error: 'Użyj endpointu GET /api/admin/dashboard z backend/src',
  });
};

const createAdminAction = (req, res) => {
  return res.status(501).json({
    error: 'Użyj endpointów /api/admin/* z backend/src',
  });
};

module.exports = {
  getAdminDashboard,
  createAdminAction,
};
