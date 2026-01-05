const express = require('express');
const router = express.Router();

const { criarCobrancaPix, registrarWebhookPix } = require('../services/efiPix.service');

// 💰 CRIAR COBRANÇA PIX
router.post('/create', async (req, res) => {
  try {
    const { valor, descricao } = req.body;

    if (!valor || !descricao) {
      return res.status(400).json({
        error: 'Valor e descrição são obrigatórios'
      });
    }

    const pix = await criarCobrancaPix(Number(valor), descricao);

    res.json(pix);
  } catch (err) {
    console.error('❌ Erro ao criar PIX:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Erro ao gerar cobrança PIX'
    });
  }
});

// 🔔 REGISTRAR WEBHOOK NA EFI (RODAR UMA VEZ)
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
