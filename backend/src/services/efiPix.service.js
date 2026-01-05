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

// 🔐 HTTPS Agent com certificado
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

// 🌐 REGISTRAR WEBHOOK
async function registrarWebhook() {
  const token = await getToken();

  const url = `${baseURL}/v2/webhook/${process.env.EFI_PIX_KEY}`;

  await axios.put(
    url,
    { webhookUrl: process.env.EFI_WEBHOOK_URL },
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("✅ Webhook registrado com sucesso");
}

// 🚀 INICIALIZAÇÃO CONTROLADA
async function initEfiPix() {
  try {
    await registrarWebhook();
  } catch (err) {
    console.error("❌ Erro ao registrar webhook:", {
      status: err.response?.status,
      data: err.response?.data || err.message,
    });
  }
}

module.exports = { initEfiPix };
