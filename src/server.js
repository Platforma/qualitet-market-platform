
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use('/api/products', require('./routes/products'));

app.get('/', (req, res) => {
  res.send('Backend dziaa na porcie ' + PORT);
});

app.listen(PORT, () => {
  console.log('Backend dziaa na porcie ' + PORT);
});

