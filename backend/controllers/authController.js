const getAuthStatus = (req, res) => {
  res.status(200).json({
    status: 'ok',
    route: 'GET /api/auth',
  });
};

const loginUser = (req, res) => {
  return res.status(501).json({
    error: 'Użyj endpointu POST /api/auth/login z backend/src',
  });
};

module.exports = {
  getAuthStatus,
  loginUser,
};
