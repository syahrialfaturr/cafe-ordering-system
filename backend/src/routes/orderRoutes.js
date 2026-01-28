const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.post('/', (req, res) => {
  const { table_number, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order items required' });
  }

  // 1. Buat order
  db.query(
    'INSERT INTO orders (table_number, status) VALUES (?, ?)',
    [table_number, 'pending'],
    (err, orderResult) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to create order' });
      }

      const orderId = orderResult.insertId;

      // 2. Simpan item satu per satu
      items.forEach(item => {
        db.query(
          'INSERT INTO order_items (order_id, menu_id, quantity) VALUES (?, ?, ?)',
          [orderId, item.menu_id, item.quantity]
        );

        // 3. Kurangi stok
        db.query(
          'UPDATE menus SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.menu_id]
        );
      });

      res.json({
        message: 'Order created successfully',
        order_id: orderId
      });
    }
  );
});

module.exports = router;
