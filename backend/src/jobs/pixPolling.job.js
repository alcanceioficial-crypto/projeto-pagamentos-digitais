const { consultarPixPorTxid } = require("../services/efiPix.service");

// SIMULA UM BANCO (troque pelo seu banco real)
const pedidos = [
  {
    txid: "TXID_TESTE_123",
    clienteId: 1,
    produtoId: 99,
    valor: "49.90",
    status: "PENDENTE",
  },
];

async function pollingPix(accessToken) {
  console.log("🔄 Iniciando polling Pix...");

  for (const pedido of pedidos) {
    if (pedido.status !== "PENDENTE") continue;

    try {
      const pix = await consultarPixPorTxid(pedido.txid, accessToken);

      if (pix.status === "CONCLUIDA") {
        console.log("✅ Pix pago:", pix.txid);

        pedido.status = "PAGO";

        liberarProduto(pedido.clienteId, pedido.produtoId);
      }
    } catch (err) {
      console.log("❌ Erro ao consultar Pix:", err.message);
    }
  }
}

function liberarProduto(clienteId, produtoId) {
  console.log(
    `🎁 Produto ${produtoId} liberado para cliente ${clienteId}`
  );

  // aqui entra:
  // - liberar download
  // - liberar acesso
  // - enviar email
}

module.exports = {
  pollingPix,
};
