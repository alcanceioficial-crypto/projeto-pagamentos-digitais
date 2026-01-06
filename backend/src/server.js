const fs = require("fs");
const app = require("./app");
const { consultarPixPorTxid } = require("./services/efiPix.service");

// 🔐 Certificado Efí (continua igual)
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// ===============================
// 🔄 POLLING PIX (SEM WEBHOOK)
// ===============================

// 🔧 EXEMPLO DE PEDIDOS (trocar pelo seu banco)
const pedidos = [
  {
    txid: "TXID_DO_CLIENTE_123",
    clienteId: 1,
    produtoId: 10,
    status: "PENDENTE",
  },
];

// ⏱️ A CADA 5 MINUTOS
setInterval(async () => {
  console.log("🔄 Verificando pagamentos Pix...");

  for (const pedido of pedidos) {
    if (pedido.status !== "PENDENTE") continue;

    try {
      const pix = await consultarPixPorTxid(pedido.txid);

      if (pix.status === "CONCLUIDA") {
        console.log("✅ Pix confirmado:", pix.txid);

        pedido.status = "PAGO";

        liberarProduto(pedido.clienteId, pedido.produtoId);
      }
    } catch (err) {
      console.error("❌ Erro ao consultar Pix:", err.message);
    }
  }
}, 300000); // 5 minutos

// 🎁 ENTREGA DO PRODUTO
function liberarProduto(clienteId, produtoId) {
  console.log(
    `🎁 Produto ${produtoId} liberado para cliente ${clienteId}`
  );

  // Aqui entra:
  // - liberar acesso
  // - liberar download
  // - marcar no banco
  // - enviar email
}
