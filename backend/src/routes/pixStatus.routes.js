const express = require('express');
const router = express.Router();
const pixStore = require('../store/pixStore');

// 🔍 CONSULTAR STATUS DO PIX
router.get('/status/:txid', (req, res) => {
  const { txid } = req.params;

  const registro = pixStore.get(txid);

  if (!registro) {
    return res.status(404).json({
      error: 'PIX não encontrado',
      txid
    });
  }

  return res.json({
    txid,
    status: registro.status,
    valor: registro.valor,
    criadoEm: registro.criadoEm,
    pagoEm: registro.pagoEm || null
  });
});

module.exports = router;
