// src/routes/pix.routes.js

import express from "express";

const router = express.Router();

router.post("/pix", (req, res) => {
  console.log("📥 Webhook Pix recebido:");
  console.dir(req.body, { depth: null });

  const evento = req.body?.pix?.[0];

  if (evento) {
    console.log("💰 Valor:", evento.valor);
    console.log("🔑 Txid:", evento.txid);
    console.log("✅ PAGAMENTO CONFIRMADO");
  }

  // Efí exige 200 OK
  res.status(200).json({ recebido: true });
});

export default router;
