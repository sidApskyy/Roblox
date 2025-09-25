require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Postgres connection
let poolConfig = {};
if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
} else {
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'registrationdb',
    password: process.env.DB_PASS || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  };
}
const pool = new Pool(poolConfig);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Ensure table exists
const ensureTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      firstname VARCHAR(100) NOT NULL,
      lastname VARCHAR(100) NOT NULL,
      username VARCHAR(100),
      gender VARCHAR(20) NOT NULL,
      email VARCHAR(150) NOT NULL,
      contactnumber VARCHAR(50) NOT NULL,
      consent BOOLEAN NOT NULL
    );
  `;
  await pool.query(createTableSQL);
};
ensureTable().catch(err => console.error('Error ensuring table:', err));

// Form submission route
app.post('/submit', async (req, res) => {
  try {
    const { firstName, lastName, username = '', gender, email, contactNumber, consent } = req.body || {};
    const consentBool = consent === true || consent === 'true';

    if (!firstName || !lastName || !gender || !email || !contactNumber || !consentBool) {
      return res.status(400).json({ success: false, message: 'Missing required fields or consent not given.' });
    }

    const insertSQL = `
      INSERT INTO registrations (firstname, lastname, username, gender, email, contactnumber, consent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const values = [
      String(firstName).trim(),
      String(lastName).trim(),
      String(username).trim(),
      String(gender).trim(),
      String(email).trim(),
      String(contactNumber).trim(),
      consentBool
    ];

    const result = await pool.query(insertSQL, values);
    return res.json({ success: true, message: 'Form submitted successfully!', id: result.rows[0].id });
  } catch (err) {
    console.error('DB insert error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Fetch all submissions (optional)
app.get('/submissions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registrations ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Test DB route
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send('Database connected! Time: ' + result.rows[0].now);
  } catch (err) {
    res.status(500).send('DB connection error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
