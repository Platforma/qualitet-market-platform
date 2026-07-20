const getOrders = (req, res) => {
  return res.status(501).json({
    error: 'Użyj endpointu GET /api/orders z backend/src',
  });
};

const createOrder = (req, res) => {
  return res.status(501).json({
    error: 'Użyj endpointu POST /api/orders z backend/src',
  });
};

module.exports = {
  getOrders,
  createOrder,
};
