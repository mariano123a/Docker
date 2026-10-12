require('dotenv').config();
const app = require('./app');
const PORT = Number(process.env.PORT || 3002);
app.listen(PORT, () => {
 console.log(`Servicio de productos ejecutándose en http://localhost:${PORT}`);
});
