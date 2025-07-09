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

function runMigrations(callback) {
  db.serialize(() => {
    console.log("Memulai proses pembuatan tabel...");
    db.run(
      `CREATE TABLE IF NOT EXISTS tweets (id TEXT PRIMARY KEY, judul TEXT, tag_teks TEXT, tag_kelas TEXT, tanggal DATE, meta_info TEXT, konten_html TEXT)`,
      () => console.log("Tabel 'tweets' siap.")
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY AUTOINCREMENT, kategori TEXT, judul TEXT, url TEXT)`,
      () => console.log("Tabel 'articles' siap.")
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS albums (id TEXT PRIMARY KEY, title TEXT, cover TEXT, description TEXT)`,
      () => console.log("Tabel 'albums' siap.")
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, album_id TEXT, url TEXT, title TEXT, FOREIGN KEY (album_id) REFERENCES albums(id))`,
      () => {
        console.log("Tabel 'photos' siap.");
        callback(); // Panggil fungsi selanjutnya setelah semua tabel siap
      }
    );
  });
}

function seedData() {
  console.log("Memulai proses memasukkan data...");

  let completedTasks = 0;
  const totalTasks = 3; // Kita punya 3 jenis data untuk dimasukkan

  function checkCompletion() {
    completedTasks++;
    if (completedTasks === totalTasks) {
      console.log("\nSemua data berhasil dimasukkan!");
      db.close((err) => {
        if (err) return console.error("Error menutup database:", err.message);
        console.log("Koneksi database ditutup dengan aman.");
      });
    }
  }

  // Hapus data lama sebelum memasukkan yang baru
  db.run("DELETE FROM tweets");
  db.run("DELETE FROM articles");
  db.run("DELETE FROM albums");
  db.run("DELETE FROM photos");

  // Masukkan data Tweets
  fs.readFile(TWEETS_JSON_PATH, "utf8", (err, data) => {
    if (err) {
      console.error("Gagal membaca informasi.json");
      checkCompletion();
      return;
    }
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
    stmt.finalize(() => {
      console.log("-> Data tweets selesai.");
      checkCompletion();
    });
  });

  // Masukkan data Articles
  fs.readFile(ARTICLES_JSON_PATH, "utf8", (err, data) => {
    if (err) {
      console.error("Gagal membaca articles.json");
      checkCompletion();
      return;
    }
    const { kategori } = JSON.parse(data);
    const stmt = db.prepare(
      "INSERT INTO articles (kategori, judul, url) VALUES (?, ?, ?)"
    );
    kategori.forEach((kat) =>
      kat.artikel.forEach((art) => stmt.run(kat.nama, art.judul, art.url))
    );
    stmt.finalize(() => {
      console.log("-> Data articles selesai.");
      checkCompletion();
    });
  });

  // Masukkan data Photos & Albums
  fs.readFile(PHOTOS_JSON_PATH, "utf8", (err, data) => {
    if (err) {
      console.error("Gagal membaca photos.json");
      checkCompletion();
      return;
    }
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
    albumStmt.finalize();
    photoStmt.finalize(() => {
      console.log("-> Data albums & photos selesai.");
      checkCompletion();
    });
  });
}

// Jalankan proses secara berurutan
runMigrations(() => {
  seedData();
});
