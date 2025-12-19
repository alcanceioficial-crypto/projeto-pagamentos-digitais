const express = require('express');
const router = express.Router();

const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC;

router.post('/pix', (req, res) => {
  console.log('📥 Webhook Pix recebido');

  const { hmac } = req.query;

  console.log('🔐 HMAC recebido:', hmac);
  console.log('🔐 HMAC esperado:', WEBHOOK_HMAC);

  // 🔐 Validação HMAC (obrigatória)
  if (!WEBHOOK_HMAC || hmac !== WEBHOOK_HMAC) {
    console.log('❌ Webhook rejeitado: HMAC inválido');
    return res.status(401).send('HMAC inválido');
  }

  const { pix } = req.body;

  if (!pix || !Array.isArray(pix)) {
    console.log('⚠️ Webhook sem array pix');
    return res.status(200).send('ok');
  }

  pix.forEach((pagamento) => {
    const { endToEndId, txid, valor, horario } = pagamento;

    console.log('💰 PAGAMENTO CONFIRMADO');
    console.log('TXID:', txid);
    console.log('EndToEndId:', endToEndId);
    console.log('Valor:', valor);
    console.log('Horário:', horario);

    // 🔜 Próximo passo:
    // - marcar pedido como pago
    // - salvar no banco
    // - disparar evento
  });

  res.status(200).send('ok');
});

module.exports = router;
