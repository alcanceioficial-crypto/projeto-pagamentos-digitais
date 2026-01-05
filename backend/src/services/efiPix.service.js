
console.log('🔥 EFI PIX SERVICE CARREGADO');
console.log('📁 Inicializando efiPix.service.js');
console.log('🌍 Ambiente:', process.env.EFI_ENV);
console.log(
  '🌐 Base URL:',
  process.env.EFI_ENV === 'homolog'
    ? 'https://pix-h.api.efipay.com.br'
    : 'https://pix.api.efipay.com.br'
);


const axios = require('axios');
const https = require('https');
const fs = require('fs');
const pool = require('../database');

const EFI_ENV = process.env.EFI_ENV || 'homolog';

const baseURL =
  EFI_ENV === 'homolog'
    ? 'https://pix-h.api.efipay.com.br'
    : 'https://pix.api.efipay.com.br';

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
      },
    }
  );

  const pix = response.data;

  // ✅ SALVA NO BANCO
  await pool.query(
    `INSERT INTO pix_pagamentos (txid, valor, status)
     VALUES ($1, $2, 'PENDENTE')`,
    [pix.txid, valor]
  );

  return {
    txid: pix.txid,
    status: 'PENDENTE',
    valor,
    pixCopiaECola: pix.pixCopiaECola
  };
}


// 🔔 REGISTRAR WEBHOOK PIX
async function registrarWebhookPix() {
  const token = await getToken();

  const chavePix = process.env.EFI_PIX_KEY;
  const webhookUrl = `${process.env.BASE_URL}/api/webhook/pix`;

  const response = await axios.put(
    `${baseURL}/v2/webhook/${chavePix}`,
    { webhookUrl },
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log('🔔 Webhook registrado com sucesso');
  return response.data;
}
module.exports = {
  criarCobrancaPix,
  registrarWebhookPix,
};
