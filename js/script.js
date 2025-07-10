// Salin dan tempel kode ini ke js/script.js (ganti semua isinya)
document.addEventListener("DOMContentLoaded", function () {
  // =========================================
  // 1. DINAMISASI HEADER & FOOTER
  // =========================================
  const loadComponent = (id, url, callback) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${url}`);
        return response.text();
      })
      .then((data) => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = data;
        if (callback) callback();
      })
      .catch((error) => console.error(error));
  };

  // Memuat Header, lalu menjalankan skrip menu & link aktif setelahnya
  loadComponent("header-placeholder", "header.html", () => {
    initializeMenu();
    setActiveNavLink();
    initializeSearchToggle(); // <-- INI BARIS YANG DITAMBAHKAN
  });

  // Memuat Footer
  loadComponent("footer-placeholder", "footer.html");

  // =========================================
  // 2. FUNGSI UNTUK NAVIGASI AKTIF
  // =========================================
  const setActiveNavLink = () => {
    // Mengambil nama file dari URL, misal: "about.html"
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll("header nav ul li a");
    navLinks.forEach((link) => {
      const linkPage = link.getAttribute("href");
      // Menandai link yang cocok atau link "index.html" jika di halaman utama
      if (
        linkPage === currentPage ||
        (currentPage === "" && linkPage === "index.html")
      ) {
        link.classList.add("active");
      }
    });
  };

  // =========================================
  // 3. SCRIPT UNTUK MENU RESPONSIVE (HAMBURGER)
  // =========================================
  const initializeMenu = () => {
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.querySelector("header nav");

    if (menuToggle && nav) {
      menuToggle.addEventListener("click", function () {
        nav.classList.toggle("active");
        const icon = menuToggle.querySelector("i");
        // Mengganti ikon antara bars dan times (X)
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      });
    }
  };
  // =========================================
  // SCRIPT UNTUK HEADER SEARCH TOGGLE
  // =========================================
  const initializeSearchToggle = () => {
    const searchContainer = document.querySelector(".search-container");
    const searchToggle = document.getElementById("search-toggle");
    const searchInput = document.getElementById("search-input-header");
    const searchForm = document.getElementById("search-form");

    if (searchToggle && searchInput && searchContainer) {
      searchToggle.addEventListener("click", function (e) {
        e.preventDefault(); // Mencegah form submit jika tombol adalah tipe submit

        const isExpanded = searchContainer.classList.contains("active");

        if (isExpanded && searchInput.value.trim() !== "") {
          // Jika sudah terbuka dan ada isinya, submit form
          searchForm.submit();
        } else {
          // Jika belum terbuka, buka bilah pencarian
          searchContainer.classList.toggle("active");
          if (searchContainer.classList.contains("active")) {
            searchInput.focus(); // Fokus ke input setelah terbuka
          }
        }
      });

      // Menutup bilah pencarian jika diklik di luar
      document.addEventListener("click", function (event) {
        if (!searchContainer.contains(event.target)) {
          searchContainer.classList.remove("active");
        }
      });
    }
  };

  // =========================================
  // 4. SCRIPT UNTUK ANIMASI ON-SCROLL (DIPERBARUI)
  // =========================================
  // Definisikan fungsi ini di window scope agar bisa diakses dari file HTML
  window.initializeScrollAnimation = function () {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
    elementsToAnimate.forEach((el) => {
      // Hanya amati elemen yang belum 'visible'
      if (!el.classList.contains("visible")) {
        observer.observe(el);
      }
    });
  };

  // Panggil fungsi animasi untuk elemen statis yang sudah ada saat halaman dimuat
  window.initializeScrollAnimation();

  // =========================================
  // 5. SCRIPT UNTUK FITUR SORTING
  // =========================================
  function sortItems(containerSelector, itemSelector, sorterId) {
    const sorter = document.getElementById(sorterId);
    const container = document.querySelector(containerSelector);

    if (!sorter || !container) return; // Keluar jika elemen tidak ada

    sorter.addEventListener("change", function () {
      const sortOrder = this.value;
      const items = Array.from(container.querySelectorAll(itemSelector));

      items.sort((a, b) => {
        const dateA = new Date(a.dataset.tanggal);
        const dateB = new Date(b.dataset.tanggal);
        return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
      });

      container.innerHTML = "";
      items.forEach((item) => container.appendChild(item));
    });
  }

  // Menerapkan fungsi sorting ke halaman yang relevan
  sortItems(".kegiatan-list", ".kegiatan-item", "kegiatan-sorter");
  sortItems(".info-list", ".info-item", "info-sorter");
}); // Akhir dari DOMContentLoaded

// =========================================
// 6. FUNGSI DEBOUNCE UNTUK OPTIMASI INPUT
// =========================================
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// =========================================
// KONFIGURASI TSPARTICLES (LATAR BELAKANG)
// Tetap di luar karena tidak perlu menunggu DOM dinamis
// =========================================
tsParticles.load("particles-js", {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: {
      value: 0.5,
      random: true,
      anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
    },
    size: { value: 2, random: true },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: { enable: true, mode: "repulse" },
      onclick: { enable: true, mode: "push" },
      resize: true,
    },
    modes: {
      repulse: { distance: 100, duration: 0.4 },
      push: { particles_nb: 4 },
    },
  },
  retina_detect: true,
});
