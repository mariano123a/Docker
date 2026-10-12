require('dotenv').config();
const app = require('./app');
const PORT = Number(process.env.PORT || 3003);
app.listen(PORT, () => {
 console.log(`Servicio de pedidos ejecutándose en http://localhost:${PORT}`);
});
