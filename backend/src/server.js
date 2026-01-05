// src/server.js

import fs from "fs";
import app from "./app.js";

// 🔐 Caminho fixo exigido pelo Render
const certPath = "/tmp/efi-cert.p12";

// 🔁 Recria certificado a partir da variável de ambiente
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
