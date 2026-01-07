// src/app.js
const express = require("express");
const cors = require("cors");
const pixRoutes = require("./routes/pix.routes");

const app = express();

/**
 * 🔓 CORS LIBERADO
 * permite Netlify → Render
 */
app.use(cors({
  origin: "*", // depois podemos restringir
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 📡 Rotas Pix
app.use("/pix", pixRoutes);

// 🩺 Health check
app.get("/", (req, res) => {
  res.json({ status: "API Pix Efí rodando" });
});

module.exports = app;
