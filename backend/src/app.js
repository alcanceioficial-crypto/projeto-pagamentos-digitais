const express = require('express');
const cors = require('cors');

const pixRoutes = require('./routes/pix.routes');
const pixWebhookRoutes = require('./routes/pixWebhook.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/pix', pixRoutes);
app.use('/pix', pixWebhookRoutes);

module.exports = app;
