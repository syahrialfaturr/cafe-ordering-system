const express = require('express');
const app = express();

require('./src/config/database');

const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const menuOptionRoutes = require('./src/routes/menuOptionRoutes');

app.use(express.json());

app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu-options', menuOptionRoutes);

app.get('/', (req, res) => {
  res.send('Ruang Kopi API is running');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
