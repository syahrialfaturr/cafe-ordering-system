const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
  const query = `
    SELECT menus.id, menus.name, menus.price, menus.stock, categories.name AS category
    FROM menus
    JOIN categories ON menus.category_id = categories.id
    WHERE menus.is_available = TRUE
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch menus' });
    }
    res.json(results);
  });
});

module.exports = router;
