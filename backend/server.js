// backend/server.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000; // Port untuk API kita

// Gunakan CORS
app.use(cors());

// Path ke database
const DB_PATH = path.join(__dirname, "blog.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error(err.message);
});

// Endpoint utama untuk mendapatkan semua tweets dengan filter, sort, dan pagination
app.get("/api/tweets", (req, res) => {
  const { search, sort } = req.query;

  let sql = `SELECT * FROM tweets`;
  const params = [];

  // Tambahkan fungsionalitas pencarian
  if (search) {
    sql += ` WHERE judul LIKE ? OR konten_html LIKE ? OR tag_teks LIKE ?`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Tambahkan fungsionalitas pengurutan
  sql += ` ORDER BY tanggal ${sort === "terlama" ? "ASC" : "DESC"}`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server API berjalan di http://localhost:${port}`);
});
