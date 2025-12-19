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
    pfx: fs.readFileSync(process.env.EFI_CERT_PATH),
    passphrase: '',
  });
}

async function getToken() {
  const response = await axios.post(
    `${baseURL}/oauth/token`,
    { grant_type: 'client_credentials' },
    {
      httpsAgent: httpsAgent(),
      auth: {
        username: process.env.EFI_CLIENT_ID,
        password: process.env.EFI_CLIENT_SECRET,
      },
    }
  );

  return response.data.access_token;
}

router.post('/pix/cob', async (req, res) => {
  try {
    const token = await getToken();

    const body = {
      calendario: { expiracao: 3600 },
      valor: { original: '19.90' },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: 'Teste PIX com QRCode',
    };

    const response = await axios.post(
      `${baseURL}/v2/cob`,
      body,
      {
        httpsAgent: httpsAgent(),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao criar cobrança Pix' });
  }
});

module.exports = router;
