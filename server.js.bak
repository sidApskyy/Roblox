const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;
const EXCEL_FILE = path.join(__dirname, 'register.xlsx');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files from project root
app.use(express.static(__dirname));

// Helper to append data to Excel
function appendToExcel(rowObj) {
  let workbook;
  let worksheet;

  if (fs.existsSync(EXCEL_FILE)) {
    workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0] || 'Registrations';
    worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    }
  } else {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
  }

  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  data.push(rowObj);

  const newWs = XLSX.utils.json_to_sheet(data, { skipHeader: false });
  workbook.Sheets[sheetName] = newWs;

  XLSX.writeFile(workbook, EXCEL_FILE);
}

// Routes
app.post('/submit', (req, res) => {
  try {
    const { firstName, lastName, username = '', gender, email, contactNumber, consent } = req.body || {};

    // Basic validation on backend as well
    if (!firstName || !lastName || !gender || !email || !contactNumber || consent !== true) {
      return res.status(400).json({ success: false, message: 'Missing required fields or consent not given.' });
    }

    const row = {
      Timestamp: new Date().toISOString(),
      FirstName: String(firstName).trim(),
      LastName: String(lastName).trim(),
      Username: String(username || '').trim(),
      Gender: String(gender).trim(),
      Email: String(email).trim(),
      ContactNumber: String(contactNumber).trim(),
      Consent: !!consent
    };

    appendToExcel(row);

    return res.json({ success: true });
  } catch (err) {
    console.error('Error handling /submit:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
