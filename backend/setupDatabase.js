const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// --- Konfigurasi Tabel ---
// Daftar semua tabel yang ingin kita buat dan isi.
// Ini membuat kode lebih rapi jika Anda ingin menambah tabel lain nanti.
const tablesConfig = [
  {
    name: "articles",
    schema: "(id INT, title TEXT, content TEXT, imageUrl TEXT)",
    jsonPath: "../articles.json",
  },
  {
    name: "informasi",
    schema: "(id INT, title TEXT, date TEXT, content TEXT)",
    jsonPath: "../informasi.json",
  },
  {
    name: "photos",
    schema: "(id INT, imageUrl TEXT, caption TEXT)",
    jsonPath: "../photos.json",
  },
];

// --- Koneksi Database ---
const dbPath = path.join(__dirname, "personal-blog.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error("❌ Gagal menyambung ke database:", err.message);
  }
  console.log("✅ Terhubung dengan database.");
  // Mulai proses utama HANYA SETELAH koneksi berhasil
  runSetup();
});

// --- Fungsi Utama untuk Menjalankan Semua Proses ---
function runSetup() {
  db.serialize(() => {
    // Langkah 1: Hapus dan buat ulang semua tabel terlebih dahulu.
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

    // Langkah 2: Masukkan data untuk semua tabel secara berurutan.
    insertAllData(() => {
      // Langkah 3 (Terakhir): Setelah semua data masuk, baru tutup koneksi.
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

/**
 * Fungsi ini akan memanggil fungsi insert untuk setiap tabel secara bergiliran.
 * @param {function} finalCallback - Fungsi yang akan dipanggil setelah semua selesai.
 */
function insertAllData(finalCallback) {
  let index = 0;
  function next() {
    if (index < tablesConfig.length) {
      // Proses satu tabel
      const table = tablesConfig[index];
      console.log(`\n--- Memproses tabel ${table.name} ---`);
      insertDataForTable(table, () => {
        // Setelah selesai, lanjut ke tabel berikutnya
        index++;
        next();
      });
    } else {
      // Jika semua tabel sudah diproses, panggil callback terakhir.
      finalCallback();
    }
  }
  next(); // Mulai dari tabel pertama
}

/**
 * Fungsi untuk membaca satu file JSON dan memasukkan datanya ke tabel yang sesuai.
 * @param {object} tableConfig - Objek konfigurasi untuk satu tabel.
 * @param {function} callback - Fungsi yang harus dipanggil setelah selesai.
 */
function insertDataForTable(tableConfig, callback) {
  const jsonFullPath = path.join(__dirname, tableConfig.jsonPath);

  fs.readFile(jsonFullPath, "utf8", (err, data) => {
    if (err) {
      console.error(
        `❌ Error membaca file ${path.basename(jsonFullPath)}:`,
        err
      );
      callback(); // Tetap panggil callback agar proses tidak berhenti
      return;
    }

    try {
      const items = JSON.parse(data);
      if (items.length === 0) {
        console.log(
          `🟡 File ${path.basename(jsonFullPath)} kosong, tidak ada data.`
        );
        callback(); // Lanjut ke tabel berikutnya
        return;
      }

      const cols = Object.keys(items[0]).join(", ");
      const placeholders = Object.keys(items[0])
        .map(() => "?")
        .join(", ");
      const sql = `INSERT INTO ${tableConfig.name} (${cols}) VALUES (${placeholders})`;

      const stmt = db.prepare(sql);
      items.forEach((item) => {
        stmt.run(Object.values(item));
      });

      // Finalize statement, dan panggil callback setelah selesai
      stmt.finalize((err) => {
        if (err) {
          console.error(
            `❌ Gagal memasukkan data untuk ${tableConfig.name}:`,
            err.message
          );
        } else {
          console.log(
            `✔️  Data dari ${path.basename(jsonFullPath)} dimasukkan.`
          );
        }
        callback(); // Panggil callback untuk menandakan proses ini selesai
      });
    } catch (parseError) {
      console.error(
        `❌ Error parsing JSON dari ${path.basename(jsonFullPath)}:`,
        parseError
      );
      callback(); // Lanjut meskipun ada error
    }
  });
}
