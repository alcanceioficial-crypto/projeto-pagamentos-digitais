const express = require('express');
const router = express.Router();
const { createPixCharge } = require('../services/efiPix.service');

router.post('/create', async (req, res) => {
  try {
    console.log('➡️ ROTA /pix/create CHAMADA');
    console.log('📦 BODY RECEBIDO:', req.body);

    const { amount, description } = req.body;

    if (!amount || !description) {
      return res.status(400).json({
        error: 'amount e description são obrigatórios'
      });
    }

    const result = await createPixCharge(amount, description);

    return res.status(201).json(result);

  } catch (error) {
    console.error('🔥 ERRO PIX - MESSAGE:', error.message);

    return res.status(500).json({
      error: 'Erro ao gerar cobrança PIX',
      detalhes: error.message
    });
  }
});

module.exports = router;
