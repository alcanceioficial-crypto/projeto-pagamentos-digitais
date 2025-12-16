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
    console.error('🔥 ERRO PIX - RESPONSE:', error.response?.data);
    console.error('🔥 ERRO PIX - STATUS:', error.response?.status);
    console.error('🔥 ERRO PIX - CONFIG URL:', error.config?.url);

    return res.status(500).json({
      error: 'Erro ao gerar cobrança PIX',
      detalhes: error.response?.data || error.message
    });
  }
});

module.exports = router;
