const express = require('express');
const router = express.Router();

/**
 * CONFIGURAÇÕES
 * =====================================================
 * Em PRODUÇÃO:
 * - EFI_WEBHOOK_HMAC vem da Efí (definido no painel)
 * - IP é validado automaticamente
 *
 * Em TESTE (Postman):
 * - Use header: x-forwarded-for = 34.193.116.226
 */

const EFI_IP = '34.193.116.226'; // IP oficial Efí (homolog)
const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC; // NUNCA hardcode em produção

router.post('/pix', (req, res) => {
  console.log('📥 Webhook Pix recebido');

  // IP real (Render + proxies)
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    '';

  const { hmac } = req.query;

  console.log('🔐 HMAC recebido:', hmac);
  console.log('🔐 HMAC esperado:', WEBHOOK_HMAC);
  console.log('🌐 IP:', ip);

  /**
   * VALIDAÇÃO 1 — HMAC
   */
  if (!WEBHOOK_HMAC || hmac !== WEBHOOK_HMAC) {
    console.log('❌ Webhook rejeitado: HMAC inválido');
    return res.status(401).send('HMAC inválido');
  }

  /**
   * VALIDAÇÃO 2 — IP DA EFÍ
   * Em testes via Postman, simule com header:
   * x-forwarded-for: 34.193.116.226
   */
  if (!ip.includes(EFI_IP)) {
    console.log('❌ Webhook rejeitado: IP não autorizado:', ip);
    return res.status(401).send('IP não autorizado');
  }

  /**
   * PAYLOAD DO PIX
   */
  console.log('✅ WEBHOOK PIX RECEBIDO COM SUCESSO');
  console.log(JSON.stringify(req.body, null, 2));

  /**
   * AQUI É ONDE VOCÊ VAI:
   * - localizar o txid
   * - confirmar pagamento
   * - atualizar pedido no banco
   */

  // A Efí EXIGE resposta 200
  return res.status(200).send('ok');
});

module.exports = router;
