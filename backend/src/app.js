// src/app.js

import express from "express";
import pixRoutes from "./routes/pix.routes.js";
import { initEfiPix } from "./services/efiPix.service.js";

const app = express();

app.use(express.json());

// 🔥 Inicializa Efí Pix (token + webhook)
initEfiPix();

// 📡 Rotas
app.use("/webhook", pixRoutes);

// 🩺 Health check
app.get("/", (req, res) => {
  res.json({ status: "API Pix Efí rodando" });
});

export default app;
