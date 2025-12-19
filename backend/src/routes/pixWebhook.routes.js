const express = require('express');
const router = express.Router();

const EFI_IP = '34.193.116.226';
const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC;

router.post('/pix', (req, res) => {
  console.log('📥 Webhook Pix recebido');

  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    '';

  const { hmac } = req.query;

  // 🔐 Validação do HMAC
  if (WEBHOOK_HMAC && hmac !== WEBHOOK_HMAC) {
    console.log('❌ HMAC inválido');
    console.log('Recebido:', hmac);
    console.log('Esperado:', WEBHOOK_HMAC);
    return res.status(401).send('HMAC inválido');
  }

  // 🔐 Validação do IP da Efí
  if (!ip.includes(EFI_IP)) {
    console.log('❌ IP não autorizado:', ip);
    return res.status(401).send('IP não autorizado');
  }

  const { pix } = req.body;

  if (!pix || !Array.isArray(pix)) {
    console.log('⚠️ Webhook sem array pix');
    return res.status(200).send('ok');
  }

  pix.forEach((pagamento) => {
    const {
      endToEndId,
      txid,
      valor,
      horario
    } = pagamento;

    console.log('💰 PAGAMENTO CONFIRMADO');
    console.log('TXID:', txid);
    console.log('EndToEndId:', endToEndId);
    console.log('Valor:', valor);
    console.log('Horário:', horario);

    // 👉 AQUI no futuro:
    // - marcar pedido como pago
    // - salvar no banco
    // - liberar produto
  });

  res.status(200).send('ok');
});

module.exports = router;
