const pedidos = new Map();

/**
 * Cria um pedido
 */
function criarPedido({ txid, valor }) {
  pedidos.set(txid, {
    txid,
    valor,
    status: 'PENDENTE',
    criadoEm: new Date(),
    pagoEm: null
  });
}

/**
 * Marca pedido como pago
 */
function confirmarPagamento(txid) {
  const pedido = pedidos.get(txid);
  if (!pedido) return null;

  pedido.status = 'PAGO';
  pedido.pagoEm = new Date();
  pedidos.set(txid, pedido);

  return pedido;
}

/**
 * Buscar pedido
 */
function buscarPedido(txid) {
  return pedidos.get(txid);
}

module.exports = {
  criarPedido,
  confirmarPagamento,
  buscarPedido
};
