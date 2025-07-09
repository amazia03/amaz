const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

// Path ke file database
const dbPath = "./personal-blog.db";

// Buat atau buka database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    createTables();
  }
});

// Fungsi untuk membuat tabel
function createTables() {
  // Tabel untuk artikel
  db.run(
    `CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT,
        category TEXT,
        tags TEXT,
        date PUBLISHED
    )`,
    (err) => {
      if (err) {
        console.error("Error creating articles table:", err.message);
      } else {
        console.log("Articles table created or already exists.");
        insertInitialArticles();
      }
    }
  );

  // Tabel untuk foto
  db.run(
    `CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        caption TEXT,
        category TEXT
    )`,
    (err) => {
      if (err) {
        console.error("Error creating photos table:", err.message);
      } else {
        console.log("Photos table created or already exists.");
        insertInitialPhotos();
      }
    }
  );
}

// Fungsi untuk memasukkan data awal artikel dari file JSON
function insertInitialArticles() {
  fs.readFile("../articles.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading articles.json:", err);
      return;
    }
    const articles = JSON.parse(data);

    // Hapus data lama sebelum memasukkan yang baru
    db.run("DELETE FROM articles", (deleteErr) => {
      if (deleteErr) {
        console.error("Error clearing articles table:", deleteErr.message);
        return;
      }
      console.log("Old articles deleted.");

      const stmt = db.prepare(
        "INSERT INTO articles (title, content, author, category, tags, date) VALUES (?, ?, ?, ?, ?, ?)"
      );
      articles.forEach((article) => {
        // Pastikan tags adalah array sebelum join
        const tags = Array.isArray(article.tags) ? article.tags.join(",") : "";
        stmt.run(
          article.title,
          article.content,
          article.author,
          article.category,
          tags,
          article.date
        );
      });
      stmt.finalize((finalizeErr) => {
        if (finalizeErr) {
          console.error(
            "Error finalizing statement for articles:",
            finalizeErr.message
          );
        } else {
          console.log("Initial articles inserted.");
        }
      });
    });
  });
}

// Fungsi untuk memasukkan data awal foto dari file JSON
function insertInitialPhotos() {
  fs.readFile("../photos.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading photos.json:", err);
      return;
    }
    const photos = JSON.parse(data);

    // Hapus data lama sebelum memasukkan yang baru
    db.run("DELETE FROM photos", (deleteErr) => {
      if (deleteErr) {
        console.error("Error clearing photos table:", deleteErr.message);
        return;
      }
      console.log("Old photos deleted.");

      const stmt = db.prepare(
        "INSERT INTO photos (url, caption, category) VALUES (?, ?, ?)"
      );
      photos.forEach((photo) => {
        stmt.run(photo.url, photo.caption, photo.category);
      });
      stmt.finalize((finalizeErr) => {
        if (finalizeErr) {
          console.error(
            "Error finalizing statement for photos:",
            finalizeErr.message
          );
        } else {
          console.log("Initial photos inserted.");
        }
      });
    });
  });
}

module.exports = db;
