
exports.getProducts = (req, res) => {
  res.json([
    { id: 1, name: 'Produkt A', price: 19.99 },
    { id: 2, name: 'Produkt B', price: 29.99 },
    { id: 3, name: 'Produkt C', price: 39.99 }
  ]);
};

