const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/status/:txid', async (req, res) => {
  const { txid } = req.params;

  const result = await pool.query(
    `SELECT * FROM pix_pagamentos WHERE txid = $1`,
    [txid]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'PIX não encontrado' });
  }

  res.json(result.rows[0]);
});

module.exports = router;
