// src/server.js

const fs = require("fs");
const app = require("./app");
const { initEfiPix } = require("./services/efiPix.service");

// 🔐 Garante que o certificado Efí exista em /tmp
const certPath = "/tmp/efi-cert.p12";

if (!fs.existsSync(certPath)) {
  const base64Cert = process.env.EFI_CERT_BASE64;

  if (!base64Cert) {
    console.error("❌ EFI_CERT_BASE64 não definido");
    process.exit(1);
  }

  const certBuffer = Buffer.from(base64Cert, "base64");
  fs.writeFileSync(certPath, certBuffer);
  console.log("📄 Certificado Efí recriado em /tmp");
}

// ✅ SOMENTE AGORA inicializa a Efí
initEfiPix();

// 🚀 Sobe o servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
