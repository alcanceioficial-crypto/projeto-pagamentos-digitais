const axios = require("axios");
const https = require("https");
const fs = require("fs");
const crypto = require("crypto");

console.log("🔥 EFI PIX SERVICE CARREGADO (SEM BANCO)");

const EFI_ENV = process.env.EFI_ENV || "production";

const baseURL =
  EFI_ENV === "homolog"
    ? "https://pix-h.api.efipay.com.br"
    : "https://pix.api.efipay.com.br";

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

// 🧾 CRIAR PIX (SEM BANCO)
async function criarPix(valor, descricao) {
  const token = await getToken();

  const txid = crypto.randomBytes(16).toString("hex");

  const body = {
    calendario: { expiracao: 3600 },
    valor: { original: valor.toFixed(2) },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: descricao,
  };

  const response = await axios.put(
    `${baseURL}/v2/cob/${txid}`,
    body,
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const qr = await axios.get(
    `${baseURL}/v2/loc/${response.data.loc.id}/qrcode`,
    {
      httpsAgent: httpsAgent(),
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return {
    txid,
    pixCopiaECola: qr.data.qrcode,
  };
}

// 🔍 CONSULTAR PIX DIRETO NA EFI (SEM BANCO)
async function consultarPixPorTxid(txid) {
  const token = await getToken();

  const response = await axios.get(
    `${baseURL}/v2/cob/${txid}`,
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

// 🧹 DESATIVADO (SEM BANCO)
async function verificarPixPendentes() {
  return;
}

module.exports = {
  criarPix,
  consultarPixPorTxid,
  verificarPixPendentes,
};
