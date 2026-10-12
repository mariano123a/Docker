require('dotenv').config();
const app = require('./app');
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
 console.log(`Servicio de usuarios ejecutándose en http://localhost:${PORT}`);
});
