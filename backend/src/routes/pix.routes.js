const express = require('express');
const router = express.Router();
const { criarCobrancaPix } = require('../services/efiPix.service');

router.post('/create', async (req, res) => {
  try {
    console.log('➡️ ROTA /pix/create CHAMADA');
    console.log('📦 BODY RECEBIDO:', req.body);

    const { amount, description } = req.body;

    const pix = await criarCobrancaPix(
      Number(amount),
      description || 'Pagamento Pix'
    );

    res.json(pix);

  } catch (err) {
    res.status(500).json({
      error: 'Erro ao gerar cobrança PIX',
      detalhes: err.response?.data || err.message
    });
  }
});

module.exports = router;
