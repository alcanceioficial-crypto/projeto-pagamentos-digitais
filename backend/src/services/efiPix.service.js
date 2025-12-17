const fs = require('fs');
const https = require('https');
const axios = require('axios');

const BASE_URL = 'https://api-homologacao.efipay.com.br';
const CERT_PATH = '/etc/secrets/efi-cert.p12';

console.log('📁 Inicializando efiPix.service.js');

const agent = new https.Agent({
  pfx: fs.readFileSync(CERT_PATH),
  passphrase: process.env.EFI_CERT_PASSPHRASE,
  rejectUnauthorized: true
});

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  httpsAgent: agent,
  timeout: 15000
});

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axiosInstance.post(
    '/oauth/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}

async function createPixCharge({ amount, description }) {
  const token = await getAccessToken();

  const response = await axiosInstance.post(
    '/v2/cob',
    {
      calendario: { expiracao: 3600 },
      valor: { original: amount.toFixed(2) },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: description
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
}

module.exports = { createPixCharge };
