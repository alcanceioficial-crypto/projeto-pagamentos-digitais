// src/server.js

const fs = require("fs");
const app = require("./app");

// 🔐 Caminho do certificado no Render
const certPath = "/tmp/efi-cert.p12";

// 🔁 Recria certificado se não existir
if (!fs.existsSync(certPath)) {
  if (!process.env.EFI_CERT_BASE64) {
    console.error("❌ EFI_CERT_BASE64 não definido");
    process.exit(1);
  }

  const certBuffer = Buffer.from(process.env.EFI_CERT_BASE64, "base64");
  fs.writeFileSync(certPath, certBuffer);
  console.log("📄 Certificado Efí recriado em /tmp");
}

// 🚀 Sobe o servidor
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
