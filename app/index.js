const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'reservasdb',
  port: process.env.DB_PORT || 5432,
});

const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS reservas (
      id SERIAL PRIMARY KEY,
      cliente VARCHAR(100) NOT NULL,
      data DATE NOT NULL,
      status VARCHAR(50) NOT NULL
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Tabela de reservas pronta/verificada na base de dados.');
  } catch (err) {
    console.error('Erro ao inicializar a base de dados:', err);
  }
};

initDb();

// 1. GET /health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// 2. POST /reservas (Create)
app.post('/reservas', async (req, res) => {
  const { cliente, data, status } = req.body;
  if (!cliente || !data || !status) {
    return res.status(400).json({ error: 'Os campos cliente, data e status são obrigatórios.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO reservas (cliente, data, status) VALUES ($1, $2, $3) RETURNING *',
      [cliente, data, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /reservas (Read All)
app.get('/reservas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservas ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /reservas/:id (Read One)
app.get('/reservas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PUT /reservas/:id (Update)
app.put('/reservas/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente, data, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE reservas SET cliente = $1, data = $2, status = $3 WHERE id = $4 RETURNING *',
      [cliente, data, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE /reservas/:id (Delete)
app.delete('/reservas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM reservas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }
    res.json({ message: 'Reserva removida com sucesso.', reserva: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API de Reservas a executar na porta ${PORT}`);
});