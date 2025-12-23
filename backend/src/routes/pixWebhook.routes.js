const express = require('express');
const router = express.Router();
const pool = require('../database');

const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC;

router.post('/pix', async (req, res) => {
  console.log('📥 Webhook Pix recebido');

  const { hmac } = req.query;
  if (hmac !== WEBHOOK_HMAC) {
    console.log('❌ HMAC inválido');
    return res.status(401).send('HMAC inválido');
  }

  const pixArray = req.body.pix || [];

  for (const pix of pixArray) {
    const result = await pool.query(
      `UPDATE pix_pagamentos
       SET status = 'PAGO', pago_em = NOW()
       WHERE txid = $1
       RETURNING *`,
      [pix.txid]
    );

    if (result.rowCount === 0) {
      console.log('⚠️ Pedido não encontrado para TXID:', pix.txid);
      continue;
    }

    console.log('✅ PAGAMENTO CONFIRMADO:', pix.txid);
  }

  res.status(200).send('ok');
});

module.exports = router;
