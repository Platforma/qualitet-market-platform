const getProducts = (req, res) => {
  res.status(200).json({
    success: true,
    route: 'GET /api/products',
    message: 'Products fetched successfully',
    data: [
      {
        id: 'p_001',
        name: 'Sample Product A',
        price: 99.99,
      },
      {
        id: 'p_002',
        name: 'Sample Product B',
        price: 149.99,
      },
    ],
  });
};

const createProduct = (req, res) => {
  const { name, price } = req.body;

  res.status(201).json({
    success: true,
    route: 'POST /api/products',
    message: 'Product created successfully (mock)',
    data: {
      id: 'p_003',
      name: name || 'New Product',
      price: price || 0,
    },
  });
};

module.exports = {
  getProducts,
  createProduct,
};
