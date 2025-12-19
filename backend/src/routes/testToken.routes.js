const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const router = express.Router();

const baseURL =
  process.env.EFI_ENV === 'homolog'
    ? 'https://pix-h.api.efipay.com.br'
    : 'https://pix.api.efipay.com.br';

function httpsAgent() {
  return new https.Agent({
    pfx: fs.readFileSync('/tmp/efi-cert.p12'),
    passphrase: ''
  });
}

router.get('/token', async (req, res) => {
  try {
    const response = await axios.post(
      `${baseURL}/oauth/token`,
      { grant_type: 'client_credentials' },
      {
        httpsAgent: httpsAgent(),
        auth: {
          username: process.env.EFI_CLIENT_ID,
          password: process.env.EFI_CLIENT_SECRET
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      erro: 'Falha ao gerar token',
      detalhe: err.response?.data || err.message
    });
  }
});

module.exports = router;
