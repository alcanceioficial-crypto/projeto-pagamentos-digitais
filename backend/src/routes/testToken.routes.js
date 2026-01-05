const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');
const fs = require('fs');

router.get('/token', async (req, res) => {
  try {
    const certPath = '/tmp/efi-cert.p12';

    const agent = new https.Agent({
      pfx: fs.readFileSync(certPath),
      passphrase: '',
    });

    const auth = Buffer.from(
      `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://pix.api.efipay.com.br/oauth/token',
      { grant_type: 'client_credentials' },
      {
        httpsAgent: agent,
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('🔐 ACCESS TOKEN GERADO:', response.data.access_token);

    res.json(response.data);
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao gerar token',
      detalhe: error.response?.data || error.message,
    });
  }
});

module.exports = router;
