const express = require('express');
const router = express.Router();

const EFI_IP = '34.193.116.226';
const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC;

router.post('/pix', (req, res) => {
  console.log('📥 Webhook Pix recebido');

  const forwardedFor = req.headers['x-forwarded-for'] || '';
  const remoteIp = req.socket.remoteAddress || '';

  const ipList = `${forwardedFor},${remoteIp}`;
  const { hmac } = req.query;

  console.log('🌐 IPs recebidos:', ipList);
  console.log('🔐 HMAC recebido:', hmac);
  console.log('🔐 HMAC esperado:', WEBHOOK_HMAC);

  // 🔐 Validação HMAC (se configurado)
  if (WEBHOOK_HMAC && hmac !== WEBHOOK_HMAC) {
    console.log('❌ Webhook rejeitado: HMAC inválido');
    return res.status(401).send('HMAC inválido');
  }

  // 🔐 Validação IP Efí
  if (!ipList.includes(EFI_IP)) {
    console.log('❌ Webhook rejeitado: IP não autorizado');
    return res.status(401).send('IP não autorizado');
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

    // 👉 Futuro:
    // marcar pedido como pago
    // salvar no banco
  });

  res.status(200).send('ok');
});

module.exports = router;
