const axios = require("axios");
const https = require("https");
const fs = require("fs");
const crypto = require("crypto");

console.log("🔥 EFI PIX SERVICE CARREGADO");

const baseURL = "https://pix.api.efipay.com.br";

// 🔐 HTTPS Agent
function httpsAgent() {
  return new https.Agent({
    pfx: fs.readFileSync("/tmp/efi-cert.p12"),
    passphrase: "",
  });
}

// 🔑 TOKEN
async function getToken() {
  const response = await axios.post(
    `${baseURL}/oauth/token`,
    { grant_type: "client_credentials" },
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

// 🆔 TXID
function gerarTxid() {
  return crypto.randomBytes(16).toString("hex");
}

// 💰 CRIAR PIX
async function criarPix(valor, descricao) {
  const token = await getToken();
  const txid = gerarTxid();

  const payload = {
    calendario: { expiracao: 3600 },
    valor: { original: valor.toFixed(2) },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: descricao,
  };

  await axios.put(`${baseURL}/v2/cob/${txid}`, payload, {
    httpsAgent: httpsAgent(),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const qr = await axios.get(`${baseURL}/v2/loc/${txid}/qrcode`, {
    httpsAgent: httpsAgent(),
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    txid,
    valor,
    copiaECola: qr.data.qrcode,
  };
}

// 🔎 CONSULTAR PIX
async function consultarPixPorTxid(txid) {
  const token = await getToken();

  const response = await axios.get(`${baseURL}/v2/cob/${txid}`, {
    httpsAgent: httpsAgent(),
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

module.exports = {
  criarPix,
  consultarPixPorTxid,
};
