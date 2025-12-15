const express = require('express');
const cors = require('cors');


const healthRoutes = require('./routes/health.routes');
const pixRoutes = require('./routes/pix.routes');


const app = express();


app.use(cors());
app.use(express.json());


app.use('/health', healthRoutes);
app.use('/pix', pixRoutes);


module.exports = app;
