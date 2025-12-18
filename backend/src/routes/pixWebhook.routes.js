const express = require('express');
const router = express.Router();

router.post('/webhook', (req, res) => {
  const hmacEsperado = 'SEGREDO123';
  const hmacRecebido = req.query.hmac;

  // 1️⃣ Valida HMAC
  if (hmacRecebido !== hmacEsperado) {
    console.log('❌ Webhook recusado (HMAC inválido)');
    return res.status(401).end();
  }

  // 2️⃣ (Opcional) validar IP da EFÍ
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log('📡 IP origem:', ip);

  // 3️⃣ Log do pagamento
  console.log('🔔 WEBHOOK PIX RECEBIDO');
  console.log(JSON.stringify(req.body, null, 2));

  // Aqui depois você:
  // - valida txid
  // - marca pedido como pago
  // - salva no banco

  res.status(200).send('OK');
});

module.exports = router;
