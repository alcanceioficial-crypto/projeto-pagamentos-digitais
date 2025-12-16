const express = require('express');
const router = express.Router();

const { createPixCharge } = require('../services/efiPix.service');

// POST /pix/create
router.post('/create', async (req, res) => {
  console.log('➡️ ROTA /pix/create CHAMADA');
  console.log('📦 BODY RECEBIDO:', req.body);

  const { amount, description } = req.body;

  if (!amount || !description) {
    return res.status(400).json({
      error: 'amount e description são obrigatórios'
    });
  }

  try {
    const pix = await createPixCharge(amount, description);
    return res.json(pix);
  } catch (error) {
    console.error('❌ ERRO AO GERAR PIX:', error.message);
    return res.status(500).json({
      error: 'Erro ao gerar cobrança PIX',
      detalhes: error.message
    });
  }
});

module.exports = router; // 🚨 ISSO É O PONTO-CHAVE
