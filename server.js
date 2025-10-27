const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Database setup
const db = new sqlite3.Database("database.db");
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    encrypted_amount TEXT,
    encrypted_note TEXT,
    key_used INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// 🔐 Fungsi Enkripsi dan Dekripsi Transposisi
function encryptTransposition(text, key) {
  if (!text) return "";
  key = parseInt(key);
  const cols = key;
  const rows = Math.ceil(text.length / cols);
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(""));
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (i < text.length) matrix[r][c] = text[i++];
    }
  }
  let cipher = "";
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      cipher += matrix[r][c] || "";
    }
  }
  return cipher;
}

function decryptTransposition(cipher, key) {
  if (!cipher) return "";
  key = parseInt(key);
  const cols = key;
  const rows = Math.ceil(cipher.length / cols);
  const fullCols = cipher.length % cols || cols;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(""));

  let i = 0;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (r === rows - 1 && c >= fullCols && cipher.length % cols !== 0) continue;
      if (i < cipher.length) matrix[r][c] = cipher[i++];
    }
  }

  let plain = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      plain += matrix[r][c] || "";
    }
  }
  return plain;
}

// 🔸 POST: Simpan data terenkripsi
app.post("/api/deposit", (req, res) => {
  const { name, amount, note, key_used } = req.body;
  if (!name || !amount || !key_used)
    return res.status(400).json({ error: "Data tidak lengkap" });

  const encrypted_amount = encryptTransposition(amount, key_used);
  const encrypted_note = encryptTransposition(note || "", key_used);

  db.run(
    `INSERT INTO deposits (name, encrypted_amount, encrypted_note, key_used) VALUES (?, ?, ?, ?)`,
    [name, encrypted_amount, encrypted_note, key_used],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        encrypted_amount,
        encrypted_note,
        decrypted_amount: decryptTransposition(encrypted_amount, key_used),
        decrypted_note: decryptTransposition(encrypted_note, key_used),
      });
    }
  );
});

// 🔹 GET: Ambil semua data (tampilkan enkripsi + deskripsi)
app.get("/api/deposits", (req, res) => {
  db.all(`SELECT * FROM deposits ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = rows.map((r) => ({
      id: r.id,
      name: r.name,
      encrypted_amount: r.encrypted_amount,
      decrypted_amount: decryptTransposition(r.encrypted_amount, r.key_used),
      encrypted_note: r.encrypted_note,
      decrypted_note: decryptTransposition(r.encrypted_note, r.key_used),
      key_used: r.key_used,
      created_at: r.created_at,
    }));

    res.json(result);
  });
});

// Jalankan server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));