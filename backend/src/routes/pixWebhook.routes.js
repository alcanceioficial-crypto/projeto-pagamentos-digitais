const express = require('express');
const router = express.Router();
const pixStore = require('../store/pixStore');

const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC;

router.post('/pix', (req, res) => {
  console.log('📥 Webhook Pix recebido');

  const { hmac } = req.query;
  if (hmac !== WEBHOOK_HMAC) {
    console.log('❌ HMAC inválido');
    return res.status(401).send('HMAC inválido');
  }

  const pixArray = req.body.pix || [];

  pixArray.forEach(pix => {
    const registro = pixStore.get(pix.txid);

    if (!registro) {
      console.log('⚠️ Pedido não encontrado para TXID:', pix.txid);
      return;
    }

    // ✅ Confirma pagamento
    registro.status = 'PAGO';
    registro.pagoEm = pix.horario;

    pixStore.set(pix.txid, registro);

    console.log('✅ PAGAMENTO CONFIRMADO');
    console.log('TXID:', pix.txid);
    console.log('VALOR:', pix.valor);
  });

  res.status(200).send('ok');
});

module.exports = router;
