const pool = require('./database');

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pix_pagamentos (
      txid TEXT PRIMARY KEY,
      valor NUMERIC(10,2) NOT NULL,
      status TEXT NOT NULL,
      criado_em TIMESTAMP DEFAULT NOW(),
      pago_em TIMESTAMP
    );
  `);

  console.log('✅ Tabela pix_pagamentos pronta');
}

module.exports = initDb;
