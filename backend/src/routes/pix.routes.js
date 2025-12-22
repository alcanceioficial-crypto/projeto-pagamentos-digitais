const express = require('express');
const router = express.Router();

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

    // 🧠 SALVA O TXID
    pixStore.set(pix.txid, {
      status: 'PENDENTE',
      valor: amount,
      criadoEm: new Date()
    });

    console.log('🧾 Cobrança criada:', pix.txid);

    const qrCodeBase64 = await gerarQrCodeBase64(pix.pixCopiaECola);

    res.json({
      ...pix,
      qrCodeBase64
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: 'Erro ao gerar cobrança PIX'
    });
  }
});

module.exports = router;
