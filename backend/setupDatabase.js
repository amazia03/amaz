// Ganti seluruh isi file backend/setupDatabase.js dengan ini
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const tablesConfig = [
  {
    name: "articles",
    schema:
      "(id INTEGER PRIMARY KEY AUTOINCREMENT, judul TEXT, url TEXT, kategori TEXT)",
    jsonPath: "../articles.json",
    dataKey: "kategori",
  },
  {
    name: "informasi",
    schema:
      "(id TEXT PRIMARY KEY, judul TEXT, tag TEXT, tanggal TEXT, meta_info TEXT, konten_html TEXT)",
    jsonPath: "../informasi.json",
    dataKey: "informasi",
  },
  // PERUBAHAN: Konfigurasi untuk tabel albums dan photos
  {
    name: "albums",
    schema: "(id TEXT PRIMARY KEY, title TEXT, cover TEXT, description TEXT)",
    jsonPath: "../photos.json",
    dataKey: "albums",
  },
  {
    name: "photos",
    schema:
      "(id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, title TEXT, album_id TEXT, FOREIGN KEY(album_id) REFERENCES albums(id))",
    jsonPath: "../photos.json",
    dataKey: "albums",
  },
];

const dbPath = path.join(__dirname, "personal-blog.db"); // Nama database yang benar
const db = new sqlite3.Database(dbPath, (err) => {
  if (err)
    return console.error("❌ Gagal menyambung ke database:", err.message);
  console.log("✅ Terhubung dengan database.");
  runSetup();
});

function runSetup() {
  db.serialize(() => {
    // Drop semua tabel terlebih dahulu
    db.run("DROP TABLE IF EXISTS photos");
    db.run("DROP TABLE IF EXISTS albums");
    db.run("DROP TABLE IF EXISTS informasi");
    db.run("DROP TABLE IF EXISTS articles");

    // Buat ulang tabel
    tablesConfig.forEach((table) => {
      db.run(
        `CREATE TABLE IF NOT EXISTS ${table.name} ${table.schema}`,
        (err) => {
          if (err)
            console.error(`❌ Gagal membuat tabel ${table.name}:`, err.message);
          else console.log(`✔️  Tabel ${table.name} berhasil dibuat.`);
        }
      );
    });

    insertAllData(() => {
      console.log("\n✨ Semua data berhasil dimasukkan!");
      db.close((err) => {
        if (err)
          return console.error("❌ Gagal menutup database:", err.message);
        console.log("🔌 Koneksi database berhasil ditutup.");
      });
    });
  });
}

function insertAllData(finalCallback) {
  // Fungsi ini tetap sama, memanggil insertDataForTable untuk setiap konfigurasi
  let index = 0;
  function next() {
    if (index < tablesConfig.length) {
      const table = tablesConfig[index];
      console.log(`\n--- Memproses data untuk tabel ${table.name} ---`);
      insertDataForTable(table, () => {
        index++;
        next();
      });
    } else {
      finalCallback();
    }
  }
  next();
}

// PERUBAHAN: Logika insert disesuaikan untuk menangani kasus spesifik
function insertDataForTable(tableConfig, callback) {
  const jsonFullPath = path.join(__dirname, tableConfig.jsonPath);
  fs.readFile(jsonFullPath, "utf8", (err, data) => {
    if (err) {
      console.error(
        `❌ Error membaca file ${path.basename(jsonFullPath)}:`,
        err
      );
      return callback();
    }
    try {
      const items = JSON.parse(data)[tableConfig.dataKey];
      if (!items || items.length === 0) return callback();

      let stmt;
      if (tableConfig.name === "albums") {
        stmt = db.prepare(
          `INSERT INTO albums (id, title, cover, description) VALUES (?, ?, ?, ?)`
        );
        items.forEach((album) =>
          stmt.run(album.id, album.title, album.cover, album.description)
        );
      } else if (tableConfig.name === "photos") {
        stmt = db.prepare(
          `INSERT INTO photos (url, title, album_id) VALUES (?, ?, ?)`
        );
        items.forEach((album) => {
          album.photos.forEach((photo) =>
            stmt.run(photo.url, photo.title, album.id)
          );
        });
      } else if (tableConfig.name === "articles") {
        stmt = db.prepare(
          `INSERT INTO articles (judul, url, kategori) VALUES (?, ?, ?)`
        );
        items.forEach((kategori) => {
          kategori.artikel.forEach((artikel) =>
            stmt.run(artikel.judul, artikel.url, kategori.nama)
          );
        });
      } else if (tableConfig.name === "informasi") {
        stmt = db.prepare(
          `INSERT INTO informasi (id, judul, tag, tanggal, meta_info, konten_html) VALUES (?, ?, ?, ?, ?, ?)`
        );
        items.forEach((item) => {
          const tagString =
            typeof item.tag === "object" ? JSON.stringify(item.tag) : item.tag;
          stmt.run(
            item.id,
            item.judul,
            tagString,
            item.tanggal,
            item.meta_info,
            item.konten_html
          );
        });
      }

      if (stmt) {
        stmt.finalize((err) => {
          if (err)
            console.error(
              `❌ Gagal insert data untuk ${tableConfig.name}:`,
              err.message
            );
          else console.log(`✔️  Data untuk ${tableConfig.name} dimasukkan.`);
          callback();
        });
      } else {
        callback();
      }
    } catch (parseError) {
      console.error(
        `❌ Error parsing JSON dari ${path.basename(jsonFullPath)}:`,
        parseError
      );
      callback();
    }
  });
}
