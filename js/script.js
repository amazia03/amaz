// Mengambil dan menampilkan artikel
fetch("/articles.json") // Path diperbaiki untuk menunjuk ke root
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    const articlesContainer = document.getElementById("articles-container");
    if (articlesContainer) {
      data.articles.forEach((article) => {
        const articleElement = document.createElement("div");
        articleElement.classList.add("article");
        articleElement.innerHTML = `
                    <h3>${article.title}</h3>
                    <p>${article.content}</p>
                    <a href="${article.url}" target="_blank">Baca selengkapnya</a>
                `;
        articlesContainer.appendChild(articleElement);
      });
    }
  })
  .catch((error) => console.error("Error fetching articles:", error));

// Mengambil dan menampilkan foto
fetch("/photos.json") // Path diperbaiki untuk menunjuk ke root
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    const photoGallery = document.getElementById("photo-gallery");
    if (photoGallery) {
      data.photos.forEach((photo) => {
        const photoElement = document.createElement("div");
        photoElement.classList.add("photo");
        photoElement.innerHTML = `
                    <img src="${photo.url}" alt="${photo.caption}">
                    <p>${photo.caption}</p>
                `;
        photoGallery.appendChild(photoElement);
      });
    }
  })
  .catch((error) => console.error("Error fetching photos:", error));

// Memuat header dan footer secara dinamis
document.addEventListener("DOMContentLoaded", function () {
  fetch("header.html")
    .then((response) => response.text())
    .then((data) => {
      const headerElement = document.querySelector("header");
      if (headerElement) {
        headerElement.innerHTML = data;
      }
    });

  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      const footerElement = document.querySelector("footer");
      if (footerElement) {
        footerElement.innerHTML = data;
      }
    });
});
