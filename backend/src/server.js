const fs = require("fs");
const app = require("./app");
const { verificarPixPendentes } = require("./services/efiPix.service");
const initDb = require("./initDB");

// 🔐 Certificado EFÍ
const certPath = "/tmp/efi-cert.p12";

if (!fs.existsSync(certPath)) {
  const base64Cert = process.env.EFI_CERT_BASE64;

  if (!base64Cert) {
    console.error("EFI_CERT_BASE64 não definido");
    process.exit(1);
  }

  fs.writeFileSync(certPath, Buffer.from(base64Cert, "base64"));
  console.log("📄 Certificado Efí recriado em /tmp");
}

const PORT = process.env.PORT || 3333;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);

  // 🔄 Inicializa banco
  await initDb();

  // ⏱️ Polling a cada 2 minutos
  setInterval(verificarPixPendentes, 2 * 60 * 1000);
});
