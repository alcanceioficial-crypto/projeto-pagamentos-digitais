const express = require('express');
const cors = require('cors');

const pixRoutes = require('./routes/pix.routes');
const pixWebhookRoutes = require('./routes/pixWebhook.routes');
const testTokenRoutes = require('./routes/testToken.routes');
const pixStatusRoutes = require('./routes/pixStatus.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Rotas da API
app.use('/api/pix', pixRoutes);
app.use('/api/webhook', pixWebhookRoutes);
app.use('/api/test', testTokenRoutes);
app.use('/api/pix', pixStatusRoutes);

// 🔹 Rota de teste (opcional)
app.get('/', (req, res) => {
  res.send('API Pix Efí rodando');
});

module.exports = app;
