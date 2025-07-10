const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// --- Konfigurasi Tabel ---
// Daftar semua tabel yang ingin kita buat dan isi.
const tablesConfig = [
  {
    name: "articles",
    // PERUBAHAN: Skema diubah total untuk menyimpan data artikel yang relevan
    schema:
      "(id INTEGER PRIMARY KEY AUTOINCREMENT, judul TEXT, url TEXT, kategori TEXT)",
    jsonPath: "../articles.json",
    dataKey: "kategori", // Kunci utama untuk data artikel
  },
  {
    name: "informasi",
    schema:
      "(id TEXT PRIMARY KEY, judul TEXT, tag TEXT, tanggal TEXT, meta_info TEXT, konten_html TEXT)",
    jsonPath: "../informasi.json",
    dataKey: "informasi",
  },
  {
    name: "photos",
    // PERUBAHAN: Skema diubah untuk menyimpan setiap foto beserta info albumnya
    schema:
      "(id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, title TEXT, album_id TEXT, album_title TEXT)",
    jsonPath: "../photos.json",
    dataKey: "albums", // Kunci utama untuk data foto
  },
];

// --- Koneksi Database ---
const dbPath = path.join(__dirname, "personal-blog.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error("❌ Gagal menyambung ke database:", err.message);
  }
  console.log("✅ Terhubung dengan database.");
  runSetup();
});

// --- Fungsi Utama untuk Menjalankan Semua Proses ---
function runSetup() {
  db.serialize(() => {
    tablesConfig.forEach((table) => {
      db.run(`DROP TABLE IF EXISTS ${table.name}`);
      db.run(`CREATE TABLE ${table.name} ${table.schema}`, (err) => {
        if (err) {
          console.error(`❌ Gagal membuat tabel ${table.name}:`, err.message);
        } else {
          console.log(`✔️  Tabel ${table.name} berhasil dibuat.`);
        }
      });
    });

    insertAllData(() => {
      console.log("\n✨ Semua data berhasil dimasukkan!");
      db.close((err) => {
        if (err) {
          return console.error("❌ Gagal menutup database:", err.message);
        }
        console.log("🔌 Koneksi database berhasil ditutup.");
      });
    });
  });
}

function insertAllData(finalCallback) {
  let index = 0;
  function next() {
    if (index < tablesConfig.length) {
      const table = tablesConfig[index];
      console.log(`\n--- Memproses tabel ${table.name} ---`);
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

/**
 * Fungsi untuk membaca satu file JSON dan memasukkan datanya ke tabel yang sesuai.
 * PERUBAHAN BESAR DI FUNGSI INI
 */
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
      const parsedData = JSON.parse(data);
      const items = parsedData[tableConfig.dataKey];

      if (!items || items.length === 0) {
        console.log(
          `🟡 File ${path.basename(
            jsonFullPath
          )} tidak memiliki data di kunci '${tableConfig.dataKey}'.`
        );
        return callback();
      }

      // PERUBAHAN: Logika khusus untuk setiap jenis tabel
      db.serialize(() => {
        if (tableConfig.name === "articles") {
          const sql = `INSERT INTO articles (judul, url, kategori) VALUES (?, ?, ?)`;
          const stmt = db.prepare(sql);
          items.forEach((kategori) => {
            const namaKategori = kategori.nama;
            kategori.artikel.forEach((artikel) => {
              stmt.run(artikel.judul, artikel.url, namaKategori);
            });
          });
          stmt.finalize();
        } else if (tableConfig.name === "photos") {
          const sql = `INSERT INTO photos (url, title, album_id, album_title) VALUES (?, ?, ?, ?)`;
          const stmt = db.prepare(sql);
          items.forEach((album) => {
            album.photos.forEach((photo) => {
              stmt.run(photo.url, photo.title, album.id, album.title);
            });
          });
          stmt.finalize();
        } else if (tableConfig.name === "informasi") {
          const processedItems = items.map((item) => {
            const newItem = { ...item };
            if (newItem.tag && typeof newItem.tag === "object") {
              newItem.tag = JSON.stringify(newItem.tag);
            }
            return newItem;
          });
          const cols = Object.keys(processedItems[0]).join(", ");
          const placeholders = Object.keys(processedItems[0])
            .map(() => "?")
            .join(", ");
          const sql = `INSERT INTO informasi (${cols}) VALUES (${placeholders})`;
          const stmt = db.prepare(sql);
          processedItems.forEach((item) => stmt.run(Object.values(item)));
          stmt.finalize();
        }

        console.log(
          `✔️  Data dari ${path.basename(jsonFullPath)} berhasil diproses.`
        );
        callback();
      });
    } catch (parseError) {
      console.error(
        `❌ Error parsing JSON dari ${path.basename(jsonFullPath)}:`,
        parseError
      );
      callback();
    }
  });
}
