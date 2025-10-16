require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// We'll support SQLite (for local) or PostgreSQL (for Render)
let db = null;
let isPostgres = false;

async function initSqlite(dbPath) {
  const sqlite3 = require('sqlite3').verbose();
  const { open } = require('sqlite');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      username TEXT,
      gender TEXT NOT NULL,
      email TEXT NOT NULL,
      contactnumber TEXT NOT NULL,
      description TEXT,
      consent BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  isPostgres = false;
}

async function initPostgres() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render
  });

  // Create table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      username TEXT,
      gender TEXT NOT NULL,
      email TEXT NOT NULL,
      contactnumber TEXT NOT NULL,
      description TEXT,
      consent BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db = pool;
  isPostgres = true;
}

async function initDB() {
  if (process.env.DATABASE_URL) {
    console.log('✅ Using PostgreSQL (Render)');
    await initPostgres();
  } else {
    const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'database.sqlite');
    console.log('✅ Using SQLite (local) at', dbPath);
    await initSqlite(dbPath);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // serves all files in same folder

// Form submission route
app.post('/submit', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username = '',
      gender,
      email,
      contactNumber,
      description = '',
      consent
    } = req.body || {};

    const consentBool = consent === true || consent === 'true' || consent === 1 || consent === '1';

    if (!firstName || !lastName || !gender || !email || !contactNumber || !consentBool) {
      return res.status(400).json({ success: false, message: 'Missing required fields or consent not given.' });
    }

    if (isPostgres) {
      const result = await db.query(
        `INSERT INTO registrations (firstname, lastname, username, gender, email, contactnumber, description, consent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [
          String(firstName).trim(),
          String(lastName).trim(),
          String(username).trim(),
          String(gender).trim(),
          String(email).trim(),
          String(contactNumber).trim(),
          String(description).trim(),
          consentBool
        ]
      );
      return res.json({ success: true, message: 'Form submitted successfully!', id: result.rows[0].id });
    } else {
      const result = await db.run(
        `INSERT INTO registrations (firstname, lastname, username, gender, email, contactnumber, description, consent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          String(firstName).trim(),
          String(lastName).trim(),
          String(username).trim(),
          String(gender).trim(),
          String(email).trim(),
          String(contactNumber).trim(),
          String(description).trim(),
          consentBool ? 1 : 0
        ]
      );
      return res.json({ success: true, message: 'Form submitted successfully!', id: result.lastID });
    }
  } catch (err) {
    console.error('DB insert error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test DB connection
app.get('/test-db', async (req, res) => {
  try {
    if (isPostgres) {
      const result = await db.query('SELECT NOW() as now');
      res.json({ db: 'postgres', time: result.rows[0].now });
    } else {
      const row = await db.get("SELECT datetime('now') as now");
      res.json({ db: 'sqlite', time: row.now });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start after DB init
initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Failed to initialize DB:', err);
    process.exit(1);
  });
