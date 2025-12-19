const express = require('express');
const cors = require('cors');

const pixRoutes = require('./routes/pix.routes');
const pixWebhookRoutes = require('./routes/pixWebhook.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas Pix
app.use('/api/pix', pixRoutes);

// Webhook Pix
app.use('/api/webhook', WebhookRoutes);
module.exports = app;
