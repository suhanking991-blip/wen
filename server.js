const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const db = new sqlite3.Database("./database.db");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Buat tabel jika belum ada
db.run(`
  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    encryptedAmount TEXT,
    decryptedAmount TEXT,
    encryptedNote TEXT,
    decryptedNote TEXT,
    keyUsed INTEGER,
    date TEXT
  )
`);

// Tambah data baru
app.post("/api/deposits", (req, res) => {
  const { name, encryptedAmount, decryptedAmount, encryptedNote, decryptedNote, keyUsed, date } = req.body;
  db.run(
    `INSERT INTO deposits (name, encryptedAmount, decryptedAmount, encryptedNote, decryptedNote, keyUsed, date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, encryptedAmount, decryptedAmount, encryptedNote, decryptedNote, keyUsed, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Ambil semua data
app.get("/api/deposits", (req, res) => {
  db.all(`SELECT * FROM deposits ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Hapus data berdasarkan ID
app.delete("/api/deposits/:id", (req, res) => {
  db.run(`DELETE FROM deposits WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server jalan di http://localhost:${PORT}`));
