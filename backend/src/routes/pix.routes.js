const express = require('express');
const router = express.Router();

const { criarCobrancaPix } = require('../services/efiPix.service');
const { gerarQrCodeBase64 } = require('../services/qrcode.service');

router.post('/create', async (req, res) => {
  try {
    console.log('➡️ ROTA /pix/create CHAMADA');
    console.log('📦 BODY RECEBIDO:', req.body);

    const { amount, description } = req.body;

    const pix = await criarCobrancaPix(
      Number(amount),
      description || 'Pagamento Pix'
    );

    console.log('💳 PIX CRIADO COM SUCESSO');

    const qrCodeBase64 = await gerarQrCodeBase64(pix.pixCopiaECola);

    console.log('🧩 QR CODE BASE64 GERADO');

    res.json({
      testeQRCode: 'ESTOU AQUI',
      ...pix,
      qrCodeBase64
    });

  } catch (err) {
    console.error('🔥 ERRO AO GERAR PIX:', err.message);

    res.status(500).json({
      error: 'Erro ao gerar cobrança PIX',
      detalhes: err.response?.data || err.message
    });
  }
});

module.exports = router;
