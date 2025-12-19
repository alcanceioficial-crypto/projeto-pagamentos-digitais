const express = require('express');
const router = express.Router();

const { confirmarPagamento } = require('../repositories/pedidos.repository');

const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC;

router.post('/pix', (req, res) => {
  console.log('📥 Webhook Pix recebido');

  const { hmac } = req.query;

  if (!WEBHOOK_HMAC || hmac !== WEBHOOK_HMAC) {
    console.log('❌ HMAC inválido');
    return res.status(401).send('HMAC inválido');
  }

  const { pix } = req.body;

  if (!pix || !Array.isArray(pix)) {
    return res.status(200).send('ok');
  }

  pix.forEach((pagamento) => {
    const { txid, valor } = pagamento;

    const pedido = confirmarPagamento(txid);

    if (pedido) {
      console.log('✅ PAGAMENTO CONFIRMADO');
      console.log('TXID:', txid);
      console.log('Valor:', valor);
    } else {
      console.log('⚠️ Pedido não encontrado para TXID:', txid);
    }
  });

  res.status(200).send('ok');
});

module.exports = router;
