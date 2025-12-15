const express = require('express');
const router = express.Router();
const gerencianet = require('../config/efi');

router.post('/create', async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: 'amount e description são obrigatórios' });
    }

    const charge = await gerencianet.pixCreateImmediateCharge([], {
      calendario: {
        expiracao: 3600
      },
      valor: {
        original: Number(amount).toFixed(2)
      },
      solicitacaoPagador: description
    });

    const qrCode = await gerencianet.pixGenerateQRCode({
      id: charge.loc.id
    });

    res.status(201).json({
      txid: charge.txid,
      qrCode: qrCode.qrcode,
      qrCodeImage: qrCode.imagemQrcode
    });

  } catch (error) {
    console.error('Erro PIX:', error?.error || error);
    res.status(500).json({
      error: 'Erro ao gerar cobrança PIX'
    });
  }
});

module.exports = router;
