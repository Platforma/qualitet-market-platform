const getOrders = (req, res) => {
  res.status(200).json({
    success: true,
    route: 'GET /api/orders',
    message: 'Orders fetched successfully',
    data: [
      {
        id: 'o_001',
        status: 'pending',
        total: 199.98,
      },
    ],
  });
};

const createOrder = (req, res) => {
  const { items } = req.body;

  res.status(201).json({
    success: true,
    route: 'POST /api/orders',
    message: 'Order created successfully (mock)',
    data: {
      id: 'o_002',
      status: 'created',
      items: items || [],
    },
  });
};

module.exports = {
  getOrders,
  createOrder,
};
