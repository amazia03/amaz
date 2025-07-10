const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// --- Konfigurasi Tabel ---
const tablesConfig = [
  {
    name: "articles",
    schema: "(id INT, title TEXT, content TEXT, imageUrl TEXT)",
    jsonPath: "../articles.json",
    // PERUBAHAN: Menambahkan kunci data untuk fleksibilitas
    dataKey: "articles",
  },
  {
    name: "informasi",
    // PERUBAHAN: Menyesuaikan skema dengan file informasi.json
    // id diubah ke TEXT, dan semua kolom dari JSON ditambahkan.
    // Kolom 'tag' akan disimpan sebagai teks JSON.
    schema:
      "(id TEXT PRIMARY KEY, judul TEXT, tag TEXT, tanggal TEXT, meta_info TEXT, konten_html TEXT)",
    jsonPath: "../informasi.json",
    dataKey: "informasi", // Kunci di dalam file JSON tempat array data berada
  },
  {
    name: "photos",
    schema: "(id INT, imageUrl TEXT, caption TEXT)",
    jsonPath: "../photos.json",
    dataKey: "photos",
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

/**
 * Fungsi ini akan memanggil fungsi insert untuk setiap tabel secara bergiliran.
 * @param {function} finalCallback - Fungsi yang akan dipanggil setelah semua selesai.
 */
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
      callback();
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      // PERUBAHAN: Mengambil array dari dalam objek JSON sesuai dataKey
      const items = parsedData[tableConfig.dataKey];

      if (!items || items.length === 0) {
        console.log(
          `🟡 File ${path.basename(
            jsonFullPath
          )} tidak memiliki data di kunci '${tableConfig.dataKey}'.`
        );
        callback();
        return;
      }

      // PERUBAHAN: Menangani data kompleks sebelum dimasukkan
      const processedItems = items.map((item) => {
        const newItem = { ...item };
        // Jika ada kolom 'tag' dan itu adalah objek, ubah jadi string
        if (newItem.tag && typeof newItem.tag === "object") {
          newItem.tag = JSON.stringify(newItem.tag);
        }
        return newItem;
      });

      const cols = Object.keys(processedItems[0]).join(", ");
      const placeholders = Object.keys(processedItems[0])
        .map(() => "?")
        .join(", ");
      const sql = `INSERT INTO ${tableConfig.name} (${cols}) VALUES (${placeholders})`;

      const stmt = db.prepare(sql);
      processedItems.forEach((item) => {
        stmt.run(Object.values(item));
      });

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
