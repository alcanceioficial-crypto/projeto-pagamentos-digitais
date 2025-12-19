const express = require('express');
const router = express.Router();

router.post('/pix', (req, res) => {
  const hmacRecebido = req.query.hmac;
  const hmacEsperado = process.env.EFI_WEBHOOK_HMAC;

  // 🔐 Validação única e correta
  if (!hmacRecebido || hmacRecebido !== hmacEsperado) {
    console.log('❌ Webhook rejeitado: HMAC inválido');
    return res.status(401).send('IP não autorizado');
  }

  console.log('🔔 WEBHOOK PIX RECEBIDO COM SUCESSO');
  console.log(JSON.stringify(req.body, null, 2));

  // Futuro:
  // - confirmar pagamento
  // - atualizar pedido
  // - salvar no banco

  res.status(200).send('ok');
});

module.exports = router;
