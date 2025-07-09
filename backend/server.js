// Salin dan tempel seluruh kode ini untuk menggantikan isi file backend/server.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(cors());

const DB_PATH = path.join(__dirname, "blog.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error(err.message);
  else console.log("Server terhubung ke database SQLite.");
});

// Endpoint untuk Tweets (seperti sebelumnya)
app.get("/api/tweets", (req, res) => {
  const { search, sort } = req.query;
  let sql = `SELECT * FROM tweets`;
  const params = [];
  if (search) {
    sql += ` WHERE judul LIKE ? OR konten_html LIKE ? OR tag_teks LIKE ?`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += ` ORDER BY tanggal ${sort === "terlama" ? "ASC" : "DESC"}`;
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "success", data: rows });
  });
});

// Endpoint BARU untuk Articles
app.get("/api/articles", (req, res) => {
  const sql = `SELECT kategori, judul, url FROM articles ORDER BY kategori`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Mengelompokkan artikel berdasarkan kategori, mirip struktur JSON asli
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.kategori]) {
        acc[row.kategori] = [];
      }
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

// Endpoint BARU untuk Photos/Albums
app.get("/api/albums", (req, res) => {
  const sql = `
      SELECT 
          a.id as album_id, a.title as album_title, a.cover, a.description,
          p.url as photo_url, p.title as photo_title
      FROM albums a
      LEFT JOIN photos p ON a.id = p.album_id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Mengelompokkan foto ke dalam albumnya masing-masing
    const albumsMap = new Map();
    rows.forEach((row) => {
      if (!albumsMap.has(row.album_id)) {
        albumsMap.set(row.album_id, {
          id: row.album_id,
          title: row.album_title,
          cover: row.cover,
          description: row.description,
          photos: [],
        });
      }
      if (row.photo_url) {
        albumsMap.get(row.album_id).photos.push({
          url: row.photo_url,
          title: row.photo_title,
        });
      }
    });

    const result = Array.from(albumsMap.values());
    res.json({ albums: result });
  });
});

app.listen(port, () => {
  console.log(`Server API berjalan di http://localhost:${port}`);
});
