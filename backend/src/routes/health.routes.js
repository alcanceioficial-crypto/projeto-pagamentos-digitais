const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/dns-test', async (req, res) => {
  try {
    await axios.get('https://api-homologacao.efipay.com.br');
    res.json({ dns: 'RESOLVEU' });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      code: err.code
    });
  }
});

module.exports = router;
