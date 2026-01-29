const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * CREATE ORDER + HITUNG TOTAL
 */
router.post('/', async (req, res) => {
  const { table_number, items } = req.body;

  if (!table_number || !items || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Buat order
    const [orderResult] = await conn.query(
      'INSERT INTO orders (table_number, status, total_price) VALUES (?, "pending", 0)',
      [table_number]
    );

    const orderId = orderResult.insertId;
    let totalPrice = 0;

    // 2. Simpan items
    for (const item of items) {
      const [[menu]] = await conn.query(
        'SELECT price FROM menus WHERE id = ?',
        [item.menu_id]
      );

      const price = menu.price;
      totalPrice += price * item.quantity;

      const [itemResult] = await conn.query(
        'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.menu_id, item.quantity, price]
      );

      const orderItemId = itemResult.insertId;

      // 3. Simpan options
      if (item.options && item.options.length > 0) {
        for (const opt of item.options) {
          await conn.query(
            'INSERT INTO order_item_options (order_item_id, option_value) VALUES (?, ?)',
            [orderItemId, opt]
          );
        }
      }
    }

    // 4. Update total
    await conn.query(
      'UPDATE orders SET total_price = ? WHERE id = ?',
      [totalPrice, orderId]
    );

    await conn.commit();

    res.json({
      message: 'Order created successfully',
      order_id: orderId,
      total_price: totalPrice
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  } finally {
    conn.release();
  }
});

module.exports = router;
