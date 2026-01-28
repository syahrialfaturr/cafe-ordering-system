const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET options by menu_id
router.get('/:menu_id', (req, res) => {
  const { menu_id } = req.params;

  const query = `
    SELECT id, name, value, extra_price
    FROM menu_options
    WHERE menu_id = ?
  `;

  db.query(query, [menu_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to get menu options' });
    }
    res.json(results);
  });
});

module.exports = router;
