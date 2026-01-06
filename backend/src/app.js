// src/app.js

const express = require("express");
const pixRoutes = require("./routes/pix.routes");

const app = express();

app.use(express.json());

// 📡 Rotas
app.use("/webhook", pixRoutes);

// 🩺 Health check
app.get("/", (req, res) => {
  res.json({ status: "API Pix Efí rodando" });
});

module.exports = app;
