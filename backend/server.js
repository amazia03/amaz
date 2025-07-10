// Ganti seluruh isi file backend/server.js dengan ini
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(cors());

// PERUBAHAN: Menggunakan nama database yang benar
const DB_PATH = path.join(__dirname, "personal-blog.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error(err.message);
  else console.log("Server terhubung ke database SQLite.");
});

// Endpoint untuk Tweets/Informasi
app.get("/api/informasi", (req, res) => {
  // Pastikan endpoint ini dipanggil jika perlu
  const sql = `SELECT * FROM informasi ORDER BY tanggal DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ informasi: rows });
  });
});

// Endpoint untuk Articles
app.get("/api/articles", (req, res) => {
  const sql = `SELECT kategori, judul, url FROM articles ORDER BY kategori`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.kategori]) acc[row.kategori] = [];
      acc[row.kategori].push({ judul: row.judul, url: row.url });
      return acc;
    }, {});
    const result = Object.keys(grouped).map((key) => ({
      nama: key,
      artikel: grouped[key],
    }));
    res.json({ kategori: result });
  });
});

// Endpoint untuk Photos/Albums
app.get("/api/albums", (req, res) => {
  const sqlAlbums = `SELECT * FROM albums`;
  db.all(sqlAlbums, [], (err, albums) => {
    if (err) return res.status(500).json({ error: err.message });

    const sqlPhotos = `SELECT * FROM photos`;
    db.all(sqlPhotos, [], (err, photos) => {
      if (err) return res.status(500).json({ error: err.message });

      // Menggabungkan foto ke dalam album yang sesuai
      const result = albums.map((album) => ({
        ...album,
        photos: photos.filter((photo) => photo.album_id === album.id),
      }));

      res.json({ albums: result });
    });
  });
});

app.listen(port, () => {
  console.log(`Server API berjalan di http://localhost:${port}`);
});
