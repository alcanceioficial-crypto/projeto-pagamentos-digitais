const express = require('express');
const router = express.Router();
const { createPixCharge } = require('../services/efiPix.service');

router.post('/create', async (req, res) => {
  console.log('➡️ ROTA /pix/create CHAMADA');
  console.log('📦 BODY RECEBIDO:', req.body);

  try {
    const { amount, description } = req.body;

    if (!amount || !description) {
      console.log('❌ BODY INVÁLIDO');
      return res.status(400).json({ error: 'amount e description são obrigatórios' });
    }

    console.log('⏳ INICIANDO createPixCharge...');
    const result = await createPixCharge(amount, description);
    console.log('✅ PIX GERADO COM SUCESSO');

    res.status(201).json(result);

  } catch (error) {
    console.log('🔥 ERRO DENTRO DO CATCH');
    console.error('Erro PIX COMPLETO:', error);
    console.error('Erro PIX RESPONSE:', error.response?.data);

    res.status(500).json({ error: 'Erro ao gerar cobrança PIX' });
  }
});

module.exports = router;
