// Salin dan tempel seluruh kode ini untuk menggantikan isi file backend/setupDatabase.js

const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "blog.db");
const TWEETS_JSON_PATH = path.join(__dirname, "..", "informasi.json");
const ARTICLES_JSON_PATH = path.join(__dirname, "..", "articles.json");
const PHOTOS_JSON_PATH = path.join(__dirname, "..", "photos.json");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) return console.error("Error membuka database:", err.message);
  console.log("Terhubung ke database SQLite.");
});

db.serialize(() => {
  console.log("Memulai proses pembuatan dan pembaruan tabel...");

  // 1. BUAT TABEL TWEETS (seperti sebelumnya)
  db.run(
    `
    CREATE TABLE IF NOT EXISTS tweets (
        id TEXT PRIMARY KEY, judul TEXT, tag_teks TEXT, tag_kelas TEXT, 
        tanggal DATE, meta_info TEXT, konten_html TEXT
    )`,
    (err) => {
      if (err) return console.error("Error membuat tabel tweets:", err.message);
      console.log("Tabel 'tweets' siap.");
    }
  );

  // 2. BUAT TABEL BARU UNTUK ARTIKEL
  db.run(
    `
    CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kategori TEXT, judul TEXT, url TEXT
    )`,
    (err) => {
      if (err)
        return console.error("Error membuat tabel articles:", err.message);
      console.log("Tabel 'articles' siap.");
    }
  );

  // 3. BUAT TABEL BARU UNTUK ALBUM & FOTO
  db.run(
    `
    CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY, title TEXT, cover TEXT, description TEXT
    )`,
    (err) => {
      if (err) return console.error("Error membuat tabel albums:", err.message);
      console.log("Tabel 'albums' siap.");
    }
  );

  db.run(
    `
    CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        album_id TEXT, url TEXT, title TEXT,
        FOREIGN KEY (album_id) REFERENCES albums(id)
    )`,
    (err) => {
      if (err) return console.error("Error membuat tabel photos:", err.message);
      console.log("Tabel 'photos' siap.");
    }
  );

  // --- PROSES MEMASUKKAN DATA ---

  // Hapus data lama agar tidak duplikat saat skrip dijalankan ulang
  db.run("DELETE FROM tweets");
  db.run("DELETE FROM articles");
  db.run("DELETE FROM albums");
  db.run("DELETE FROM photos");

  // Memasukkan data Tweets
  fs.readFile(TWEETS_JSON_PATH, "utf8", (err, data) => {
    if (err) return;
    const { informasi } = JSON.parse(data);
    const stmt = db.prepare(
      "INSERT INTO tweets (id, judul, tag_teks, tag_kelas, tanggal, meta_info, konten_html) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    informasi.forEach((item) =>
      stmt.run(
        item.id,
        item.judul,
        item.tag.teks,
        item.tag.kelas,
        item.tanggal,
        item.meta_info,
        item.konten_html
      )
    );
    stmt.finalize(() => console.log("Data tweets berhasil dimasukkan."));
  });

  // Memasukkan data Articles
  fs.readFile(ARTICLES_JSON_PATH, "utf8", (err, data) => {
    if (err) return;
    const { kategori } = JSON.parse(data);
    const stmt = db.prepare(
      "INSERT INTO articles (kategori, judul, url) VALUES (?, ?, ?)"
    );
    kategori.forEach((kat) =>
      kat.artikel.forEach((art) => stmt.run(kat.nama, art.judul, art.url))
    );
    stmt.finalize(() => console.log("Data articles berhasil dimasukkan."));
  });

  // Memasukkan data Photos & Albums
  fs.readFile(PHOTOS_JSON_PATH, "utf8", (err, data) => {
    if (err) return;
    const { albums } = JSON.parse(data);
    const albumStmt = db.prepare(
      "INSERT INTO albums (id, title, cover, description) VALUES (?, ?, ?, ?)"
    );
    const photoStmt = db.prepare(
      "INSERT INTO photos (album_id, url, title) VALUES (?, ?, ?)"
    );
    albums.forEach((album) => {
      albumStmt.run(album.id, album.title, album.cover, album.description);
      album.photos.forEach((photo) =>
        photoStmt.run(album.id, photo.url, photo.title)
      );
    });
    albumStmt.finalize(() => console.log("Data albums berhasil dimasukkan."));
    photoStmt.finalize(() => console.log("Data photos berhasil dimasukkan."));
  });
});

db.close((err) => {
  if (err) return console.error("Error menutup database:", err.message);
  console.log("Koneksi database ditutup setelah semua proses selesai.");
});
