// backend/setupDatabase.js

const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Tentukan path ke database dan file JSON
const DB_PATH = path.join(__dirname, "blog.db");
const INFO_JSON_PATH = path.join(__dirname, "..", "informasi.json"); // '..' untuk naik satu level

// Buat koneksi ke database (file blog.db akan dibuat jika belum ada)
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    return console.error("Error saat membuka database:", err.message);
  }
  console.log("Terhubung ke database SQLite.");
});

db.serialize(() => {
  // 1. Buat tabel 'tweets' jika belum ada
  db.run(
    `CREATE TABLE IF NOT EXISTS tweets (
        id TEXT PRIMARY KEY,
        judul TEXT,
        tag_teks TEXT,
        tag_kelas TEXT,
        tanggal DATE,
        meta_info TEXT,
        konten_html TEXT
    )`,
    (err) => {
      if (err) return console.error("Error membuat tabel:", err.message);
      console.log("Tabel 'tweets' berhasil dibuat atau sudah ada.");

      // 2. Baca file informasi.json
      fs.readFile(INFO_JSON_PATH, "utf8", (err, data) => {
        if (err)
          return console.error("Error membaca informasi.json:", err.message);

        const { informasi } = JSON.parse(data);
        const stmt = db.prepare(
          "INSERT OR IGNORE INTO tweets (id, judul, tag_teks, tag_kelas, tanggal, meta_info, konten_html) VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        // 3. Masukkan setiap item ke dalam database
        console.log("Memasukkan data dari informasi.json...");
        informasi.forEach((item) => {
          stmt.run(
            item.id,
            item.judul,
            item.tag.teks,
            item.tag.kelas,
            item.tanggal,
            item.meta_info,
            item.konten_html
          );
        });

        stmt.finalize((err) => {
          if (err)
            return console.error("Error finalisasi statement:", err.message);
          console.log("Semua data berhasil dimasukkan ke dalam tabel tweets.");
        });
      });
    }
  );
});

// Tutup koneksi database
db.close((err) => {
  if (err) return console.error("Error menutup database:", err.message);
  console.log("Koneksi database ditutup.");
});
