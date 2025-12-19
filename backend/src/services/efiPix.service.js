// src/services/efiPix.service.js

const axios = require('axios');
const https = require('https');
const fs = require('fs');
const pixStore = require('../store/pixStore');

console.log('📁 Inicializando efiPix.service.js');

const EFI_ENV = process.env.EFI_ENV || 'homolog';

const baseURL =
  EFI_ENV === 'homolog'
    ? 'https://pix-h.api.efipay.com.br'
    : 'https://pix.api.efipay.com.br';

console.log('🌍 Ambiente:', EFI_ENV);
console.log('🌐 Base URL:', baseURL);

function httpsAgent() {
  return new https.Agent({
    pfx: fs.readFileSync('/tmp/efi-cert.p12'),
    passphrase: '',
  });
}

// 🔑 TOKEN
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

// 💰 CRIAR COBRANÇA PIX
async function criarCobrancaPix(valor, descricao) {
  const token = await getToken();

  const body = {
    calendario: { expiracao: 3600 },
    valor: { original: valor.toFixed(2) },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: descricao,
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

  const pix = response.data;

  // 🧠 SALVA O TXID EM MEMÓRIA
  pixStore.set(pix.txid, {
    status: 'PENDENTE',
    valor,
    criadoEm: new Date(),
  });

  console.log('🧾 PIX criado e armazenado:', pix.txid);

  return {
    txid: pix.txid,
    valor,
    pixCopiaECola: pix.pixCopiaECola,
  };
}

module.exports = {
  criarCobrancaPix,
};
