const getProducts = (req, res) => {
  return res.status(501).json({
    error: 'Użyj endpointu GET /api/products z backend/src',
  });
};

const createProduct = (req, res) => {
  return res.status(501).json({
    error: 'Użyj endpointu POST /api/products z backend/src',
  });
};

module.exports = {
  getProducts,
  createProduct,
};
