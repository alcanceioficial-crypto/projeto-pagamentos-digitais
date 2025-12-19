// src/routes/pixWebhook.routes.js

const express = require('express');
const router = express.Router();
const pixStore = require('../store/pixStore');

// IPs oficiais da Efí (homolog)
// em produção podem existir mais, mas esse já funcionou pra você
const EFI_IP = '34.193.116.226';

// HMAC vem SOMENTE da variável de ambiente
const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC;

router.post('/pix', (req, res) => {
  console.log('📥 Webhook Pix recebido');

  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    '';

  const { hmac } = req.query;

  console.log('🔐 HMAC recebido:', hmac);
  console.log('🔐 HMAC esperado:', WEBHOOK_HMAC);
  console.log('🌐 IP:', ip);

  // 🔐 Validação do HMAC
  if (!WEBHOOK_HMAC || hmac !== WEBHOOK_HMAC) {
    console.log('❌ Webhook rejeitado: HMAC inválido');
    return res.status(401).send('HMAC inválido');
  }

  // 🔐 Validação do IP da Efí
  if (!ip.includes(EFI_IP)) {
    console.log('❌ Webhook rejeitado: IP não autorizado');
    return res.status(401).send('IP não autorizado');
  }

  // 📦 Payload do Pix
  const evento = req.body;

  if (!evento || !evento.pix || !evento.pix.length) {
    console.log('⚠️ Webhook recebido sem eventos PIX');
    return res.status(200).send('ok');
  }

  // 🔁 Pode vir mais de um Pix no array
  evento.pix.forEach(pix => {
    const txid = pix.txid;

    const pedido = pixStore.get(txid);

    if (!pedido) {
      console.log('⚠️ Pedido não encontrado para TXID:', txid);
      return;
    }

    pedido.status = 'PAGO';
    pedido.pagoEm = new Date();
    pedido.endToEndId = pix.endToEndId;
    pedido.valorPago = pix.valor;

    pixStore.set(txid, pedido);

    console.log('✅ PIX CONFIRMADO');
    console.log('TXID:', txid);
    console.log('VALOR:', pix.valor);
  });

  // ⚠️ A Efí exige HTTP 200
  res.status(200).send('ok');
});

module.exports = router;
