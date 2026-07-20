const getAuthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    route: 'GET /api/auth',
    message: 'Auth route is working',
    data: {
      authenticated: false,
    },
  });
};

const loginUser = (req, res) => {
  const { email } = req.body;

  res.status(200).json({
    success: true,
    route: 'POST /api/auth',
    message: 'Mock login successful',
    data: {
      user: {
        id: 'u_001',
        email: email || 'demo@qualitetmarket.com',
      },
      token: 'mock-jwt-token',
    },
  });
};

module.exports = {
  getAuthStatus,
  loginUser,
};
