const express = require('express');
const router = express.Router();
const { registrarWebhookPix } = require('../services/efiPix.service');
const { criarCobrancaPix } = require('../services/efiPix.service');
const { gerarQrCodeBase64 } = require('../services/qrcode.service');
const pixStore = require('../store/pixStore');

router.post('/create', async (req, res) => {
  try {
    const { amount, description } = req.body;

    const pix = await criarCobrancaPix(
      Number(amount),
      description || 'Pagamento Pix'
    );

    // 🔐 Salva a cobrança em memória
    pixStore.set(pix.txid, {
      status: 'PENDENTE',
      valor: amount,
      criadoEm: new Date()
    });

    const qrCodeBase64 = await gerarQrCodeBase64(pix.pixCopiaECola);

    res.json({
      ...pix,
      qrCodeBase64
    });

  } catch (err) {
    res.status(500).json({
      error: 'Erro ao gerar cobrança PIX',
      detalhes: err.response?.data || err.message
    });
    // 🔧 REGISTRAR WEBHOOK NA EFI (RODAR UMA VEZ)
router.post('/webhook/register', async (req, res) => {
  try {
    const result = await registrarWebhookPix();
    res.json({
      success: true,
      result
    });
  } catch (err) {
    console.error('❌ Erro ao registrar webhook:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Erro ao registrar webhook'
    });
  }
});

module.exports = router;
