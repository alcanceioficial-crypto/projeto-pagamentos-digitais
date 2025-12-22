const express = require('express');
const router = express.Router();
const pixStore = require('../store/pixStore');

const EFI_IP = '34.193.116.226';
const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC;

router.post('/pix', (req, res) => {
  console.log('📥 Webhook Pix recebido');

  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    '';

  const { hmac } = req.query;

  // 🔐 HMAC
  if (!WEBHOOK_HMAC || hmac !== WEBHOOK_HMAC) {
    return res.status(401).send('HMAC inválido');
  }

  // 🔐 IP
  if (!ip.includes(EFI_IP)) {
    return res.status(401).send('IP não autorizado');
  }

  const pixArray = req.body?.pix || [];

  pixArray.forEach(pix => {
    const txid = pix.txid;

    if (!pixStore.has(txid)) {
      console.log('⚠️ Pedido não encontrado para TXID:', txid);
      return;
    }

    // ✅ CONFIRMA PAGAMENTO
    pixStore.set(txid, {
      ...pixStore.get(txid),
      status: 'PAGO',
      pagoEm: new Date(),
      endToEndId: pix.endToEndId,
      valorRecebido: pix.valor
    });

    console.log('💰 Pagamento confirmado:', txid);
  });

  return res.status(200).send('ok');
});

module.exports = router;
