import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mariadb from 'mariadb';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

app.use(express.static('dist'));
app.use(bodyParser.json());
app.use(cors());

// Create a pool of connections to the MariaDB server
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Route to get all future timers
app.get('/timers', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query('SELECT * FROM timers WHERE time > NOW()');
    conn.release();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching timers', error: err });
  }
});

// Route to add a new timer
app.post('/add-timer', async (req, res) => {
  const { type, name, link, time, region, country, timeZone, logo } = req.body;

  try {
    const conn = await pool.getConnection();
    const query = 'INSERT INTO timers (type, name, link, time, region, country, timeZone, logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const result = await conn.query(query, [type, name, link, time, region, country, timeZone, logo]);
    conn.release();
    res.status(201).send({ message: 'Timer added successfully', timerId: result.insertId.toString() });
  } catch (err) {
    res.status(500).send({ message: 'Error adding timer', error: err });
  }
});

// Emulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Catch-all route to serve index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
