const fs = require("fs");
const app = require("./app");
const { initEfiPix } = require("./services/efiPix.service");

// 🔐 Certificado Efí
const certPath = "/tmp/efi-cert.p12";

if (!fs.existsSync(certPath)) {
  const base64Cert = process.env.EFI_CERT_BASE64;

  if (!base64Cert) {
    console.error("❌ EFI_CERT_BASE64 não definido");
    process.exit(1);
  }

  fs.writeFileSync(certPath, Buffer.from(base64Cert, "base64"));
  console.log("📄 Certificado Efí recriado em /tmp");
}

// 🚀 Sobe servidor
const PORT = process.env.PORT || 3333;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);

  // 🔥 AGORA SIM — depois do certificado
  await initEfiPix();
});
