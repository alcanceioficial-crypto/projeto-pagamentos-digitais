// src/services/efiPix.service.js

const axios = require("axios");
const https = require("https");
const fs = require("fs");

console.log("🔥 EFI PIX SERVICE CARREGADO");
console.log("📁 Inicializando efiPix.service.js");

const EFI_ENV = process.env.EFI_ENV || "production";

const baseURL =
  EFI_ENV === "sandbox"
    ? "https://pix-h.api.efipay.com.br"
    : "https://pix.api.efipay.com.br";

console.log("🌍 Ambiente:", EFI_ENV);
console.log("🌐 Base URL:", baseURL);

// 🔐 HTTPS Agent com certificado
const httpsAgent = new https.Agent({
  pfx: fs.readFileSync("/tmp/efi-cert.p12"),
  passphrase: process.env.EFI_CERT_PASSWORD,
});

// 🔑 Registrar webhook Pix
async function registrarWebhook() {
  try {
    const chavePix = process.env.EFI_PIX_KEY;
    const webhookUrl = process.env.EFI_WEBHOOK_URL;
    const accessToken = process.env.EFI_ACCESS_TOKEN;

    const response = await axios.put(
      `${baseURL}/v2/webhook/${chavePix}`,
      { webhookUrl },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        httpsAgent,
      }
    );

    console.log("✅ Webhook registrado com sucesso:", response.data);
  } catch (error) {
    console.error("❌ Erro ao registrar webhook:", {
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}

// 🔥 Inicialização automática
function initEfiPix() {
  registrarWebhook();
}

module.exports = { initEfiPix };
