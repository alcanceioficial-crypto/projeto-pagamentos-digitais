const express = require('express');
const cors = require('cors');

const pixRoutes = require('./routes/pix.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/pix', pixRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
