// src/app.js

const express = require("express");
const pixRoutes = require("./routes/pix.routes");
const { initEfiPix } = require("./services/efiPix.service");

const app = express();

app.use(express.json());

// 🔥 Inicializa Efí Pix (registra webhook)
initEfiPix();

// 📡 Rotas
app.use("/webhook", pixRoutes);

// 🩺 Health check
app.get("/", (req, res) => {
  res.json({ status: "API Pix Efí rodando" });
});

module.exports = app;
