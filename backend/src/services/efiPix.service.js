const fs = require('fs');
const path = require('path');
const axios = require('axios');

const EFI_ENV = process.env.EFI_ENV || 'homolog';

const BASE_URL =
  EFI_ENV === 'production'
    ? 'https://api.efipay.com.br'
    : 'https://api-homologacao.efipay.com.br';

const CERT_PATH = '/etc/secrets/efi-cert.p12';

console.log('📁 Inicializando efiPix.service.js');
console.log('🌍 Ambiente:', EFI_ENV);
console.log('🌐 Base URL:', BASE_URL);
console.log('📄 Certificado:', CERT_PATH);

if (!fs.existsSync(CERT_PATH)) {
  throw new Error('❌ Certificado .p12 não encontrado');
}

const certBuffer = fs.readFileSync(CERT_PATH);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  httpsAgent: new (require('https').Agent)({
    pfx: certBuffer,
    passphrase: undefined,
    rejectUnauthorized: true
  })
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

  const payload = {
    calendario: {
      expiracao: 3600
    },
    valor: {
      original: amount.toFixed(2)
    },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: description
  };

  const response = await axiosInstance.post(
    '/v2/cob',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
}

module.exports = {
  createPixCharge
};
