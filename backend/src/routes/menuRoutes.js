const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ===============================
// GET ALL MENUS
// ===============================
router.get('/', (req, res) => {
  const sql = `
    SELECT id, name, price, stock, image_url, category
    FROM menus
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('ERROR LOAD MENUS:', err);
      return res.status(500).json({ message: 'Failed to load menus' });
    }

    res.json(results);
  });
});

module.exports = router;
