// src/app.js
const express = require("express");
const cors = require("cors");
const pixRoutes = require("./routes/pix.routes");

const app = express();

/**
 * 🔓 CORS LIBERADO
 * Netlify → Render
 */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 👇 MUITO IMPORTANTE (preflight)
app.options("*", cors());

app.use(express.json());

// 📡 Rotas Pix
app.use("/pix", pixRoutes);

// 🩺 Health check
app.get("/", (req, res) => {
  res.json({ status: "API Pix Efí rodando" });
});

module.exports = app;
