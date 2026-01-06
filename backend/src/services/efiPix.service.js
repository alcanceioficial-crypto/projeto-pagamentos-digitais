// src/services/efiPix.service.js

const axios = require("axios");
const https = require("https");
const fs = require("fs");

console.log("🔥 EFI PIX SERVICE CARREGADO");
console.log("📁 Inicializando efiPix.service.js");

const EFI_ENV = process.env.EFI_ENV || "production";

const baseURL =
  EFI_ENV === "homolog"
    ? "https://pix-h.api.efipay.com.br"
    : "https://pix.api.efipay.com.br";

console.log("🌍 Ambiente:", EFI_ENV);
console.log("🌐 Base URL:", baseURL);

// 🔐 HTTPS Agent
function httpsAgent() {
  const certPath = "/tmp/efi-cert.p12";

  if (!fs.existsSync(certPath)) {
    throw new Error("❌ Certificado Efí não encontrado em /tmp");
  }

  return new https.Agent({
    pfx: fs.readFileSync(certPath),
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

// 🔍 CONSULTAR PIX POR TXID (FUNÇÃO QUE FALTAVA)
async function consultarPixPorTxid(txid) {
  const token = await getToken();

  const response = await axios.get(
    `${baseURL}/v2/pix/${txid}`,
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

module.exports = {
  consultarPixPorTxid,
};
