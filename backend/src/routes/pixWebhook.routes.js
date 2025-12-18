const express = require('express');
const router = express.Router();

router.post('/webhook', (req, res) => {
  console.log('🔔 WEBHOOK PIX RECEBIDO');
  console.log(JSON.stringify(req.body, null, 2));

  // IMPORTANTE:
  // Aqui futuramente você:
  // - valida txid
  // - marca pedido como PAGO
  // - salva data, valor, endToEndId

  res.status(200).send('OK');
});

module.exports = router;
