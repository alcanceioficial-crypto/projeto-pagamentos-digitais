const express = require('express');
const router = express.Router();

const EFI_IP = '34.193.116.226';
const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC || 'meu-hmac-secreto';

router.post('/pix', (req, res) => {
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    '';

  const { hmac } = req.query;

  // 🔐 Validação do HMAC
  if (hmac !== WEBHOOK_HMAC) {
    console.log('❌ Webhook rejeitado: HMAC inválido');
    return res.status(401).send('HMAC inválido');
  }

  // 🔐 Validação do IP da Efí
  if (!ip.includes(EFI_IP)) {
    console.log('❌ Webhook rejeitado: IP não autorizado:', ip);
    return res.status(401).send('IP não autorizado');
  }

  console.log('🔔 WEBHOOK PIX RECEBIDO COM SUCESSO');
  console.log(JSON.stringify(req.body, null, 2));

  res.status(200).send('ok');
});

module.exports = router;
