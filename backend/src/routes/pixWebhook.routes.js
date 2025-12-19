const express = require('express');
const router = express.Router();

/**
 * IP oficial da Efí (homologação)
 * Em produção podemos ampliar para lista de IPs
 */
const EFI_IP = '34.193.116.226';

/**
 * HMAC configurado no painel da Efí
 * O valor REAL deve estar na variável de ambiente
 */
const WEBHOOK_HMAC = process.env.EFI_WEBHOOK_HMAC;

/**
 * Webhook Pix Efí
 * Endpoint: POST /api/webhook/pix?hmac=SEU_HMAC
 */
router.post('/pix', (req, res) => {
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    '';

  const { hmac } = req.query;

  console.log('📥 Webhook chamado');
  console.log('🔐 HMAC recebido:', hmac);
  console.log('🔐 HMAC esperado:', WEBHOOK_HMAC);
  console.log('🌐 IP:', ip);

  // 🔐 Validação 1 — HMAC
  if (!WEBHOOK_HMAC || hmac !== WEBHOOK_HMAC) {
    console.log('❌ Webhook rejeitado: HMAC inválido');
    return res.status(401).send('HMAC inválido');
  }

  // 🔐 Validação 2 — IP da Efí
  // ⚠️ Para testes via Postman, este bloco pode ser comentado
  if (!ip.includes(EFI_IP)) {
    console.log('❌ Webhook rejeitado: IP não autorizado:', ip);
    return res.status(401).send('IP não autorizado');
  }

  console.log('✅ WEBHOOK PIX RECEBIDO COM SUCESSO');
  console.log('📦 Payload recebido:');
  console.log(JSON.stringify(req.body, null, 2));

  /**
   * Futuro:
   * - Confirmar pagamento
   * - Atualizar pedido
   * - Salvar no banco
   */

  // A Efí exige resposta HTTP 200
  res.status(200).send('ok');
});

module.exports = router;
