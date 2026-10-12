const express = require('express');
const pool = require('./db');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => {
 res.json({ estado: 'ok', servicio: 'productos' });
});
app.get('/productos', async (req, res) => {
 try {
  const result = await pool.query('SELECT * FROM productos ORDER BY id');
  res.json(result.rows);
 } catch (error) {
  console.error(error.message);
  res.status(500).json({ error: 'Error al consultar productos' });
 }
});
module.exports = app;

