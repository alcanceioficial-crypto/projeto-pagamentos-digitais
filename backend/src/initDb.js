const pool = require('./database');

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pix_pagamentos (
        txid TEXT PRIMARY KEY,
        valor NUMERIC(10,2) NOT NULL,
        status TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pago_em TIMESTAMP
      );
    `);

    console.log('✅ Tabela pix_pagamentos pronta');
  } catch (err) {
    console.error('❌ Erro ao inicializar banco:', err.message);
    process.exit(1);
  }
}

module.exports = initDb;
