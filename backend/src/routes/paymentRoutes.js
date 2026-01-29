const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.post('/', async (req, res) => {
  const { order_id, method } = req.body;

  if (!order_id || !method) {
    return res.status(400).json({ message: 'order_id and method are required' });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[result]] = await conn.query(
      `
      SELECT SUM(oi.quantity * m.price) AS total
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = ?
      `,
      [order_id]
    );

    if (!result.total) {
      return res.status(404).json({ message: 'Order not found or empty' });
    }

    const totalAmount = result.total;

    await conn.query(
      'INSERT INTO payments (order_id, method, amount, status) VALUES (?, ?, ?, "paid")',
      [order_id, method, totalAmount]
    );

    await conn.query(
      'UPDATE orders SET status = "paid" WHERE id = ?',
      [order_id]
    );

    await conn.commit();

    res.json({
      message: 'Payment successful',
      order_id,
      amount: totalAmount,
      method
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to create payment' });
  } finally {
    conn.release();
  }
});

module.exports = router;
