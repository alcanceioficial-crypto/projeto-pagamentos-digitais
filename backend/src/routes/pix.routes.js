const express = require('express');
const router = express.Router();
const { createPixCharge } = require('../services/efiPix.service');

router.post('/create', async (req, res) => {
  try {
    console.log('➡️ ROTA /pix/create CHAMADA');
    console.log('📦 BODY RECEBIDO:', req.body);

    const { amount, description } = req.body;

    const pix = await createPixCharge({ amount, description });

    res.json(pix);
  } catch (error) {
    console.error('🔥 ERRO AO GERAR PIX:', error.message);

    res.status(500).json({
      error: 'Erro ao gerar cobrança PIX',
      detalhes: error.message
    });
  }
});

module.exports = router;
