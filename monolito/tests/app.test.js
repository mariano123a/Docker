const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

afterAll(async () => {
  await pool.end();
});

test('GET /health responde correctamente', async () => {
  const response = await request(app).get('/health');

  expect(response.statusCode).toBe(200);
  expect(response.body.estado).toBe('ok');
});

test.each(['/usuarios', '/productos', '/pedidos'])(
  'GET %s devuelve registros',
  async (ruta) => {
    const response = await request(app).get(ruta);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  }
);
