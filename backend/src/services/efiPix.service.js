const axios = require('axios');
const https = require('https');
const fs = require('fs');

console.log('📁 Inicializando efiPix.service.js');

const BASE_URL = 'https://pix-h.api.efipay.com.br';
const CERT_PATH = '/etc/secrets/efi-cert.p12';

/**
 * Gera o access_token da EFÍ (Pix)
 */
async function getAccessToken() {
  try {
    console.log('🔐 Solicitando access token EFÍ...');

    const httpsAgent = new https.Agent({
      pfx: fs.readFileSync(CERT_PATH),
      rejectUnauthorized: true
    });

    const auth = Buffer.from(
      `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      `${BASE_URL}/oauth/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent
      }
    );

    console.log('✅ TOKEN GERADO');
    return response.data.access_token;

  } catch (err) {
    console.error('🔥 ERRO TOKEN:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * Cria cobrança Pix imediata
 */
async function criarCobrancaPix(valor, descricao) {
  try {
    console.log('💰 Criando cobrança PIX...');

    const token = await getAccessToken();

    const payload = {
      calendario: {
        expiracao: 3600
      },
      valor: {
        original: valor.toFixed(2)
      },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: descricao
    };

    const httpsAgent = new https.Agent({
      pfx: fs.readFileSync(CERT_PATH),
      rejectUnauthorized: true
    });

    const response = await axios.post(
      `${BASE_URL}/v2/cob`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    console.log('✅ PIX GERADO');
    return response.data;

  } catch (err) {
    console.error('🔥 ERRO AO GERAR PIX:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = {
  criarCobrancaPix
};
