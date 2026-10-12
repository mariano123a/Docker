const express = require('express');
const pool = require('./db');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => {
 res.json({ estado: 'ok', servicio: 'pedidos' });
});
app.get('/pedidos', async (req, res) => {
 try {
  const result = await pool.query('SELECT * FROM pedidos ORDER BY id');
  res.json(result.rows);
 } catch (error) {
  console.error(error.message);
  res.status(500).json({ error: 'Error al consultar pedidos' });
 }
});
module.exports = app;

