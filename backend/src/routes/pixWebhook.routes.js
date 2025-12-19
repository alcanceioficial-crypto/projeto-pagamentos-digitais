const express = require('express');
const router = express.Router();
const { registrarWebhookPix } = require('../services/efiWebhook.service');

router.post('/register', async (req, res) => {
  try {
    const result = await registrarWebhookPix();
    res.json({
      message: 'Webhook PIX registrado com sucesso',
      result
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: 'Erro ao registrar webhook',
      detalhes: err.response?.data || err.message
    });
  }
});

module.exports = router;
