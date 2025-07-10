document.addEventListener("DOMContentLoaded", function () {
  // =========================================
  // 1. INISIALISASI SEMUA FUNGSI SAAT DOM SIAP
  // =========================================
  initializeMenu();
  setActiveNavLink();
  initializeSearchToggle();
  window.initializeScrollAnimation();

  // Fungsi sorting tidak lagi dipanggil di sini, tapi di halaman spesifik
  // agar tidak error di halaman lain.
}); // Akhir dari DOMContentLoaded

// =========================================
// 2. SEMUA FUNGSI PEMBANTU
// =========================================

function setActiveNavLink() {
  const currentPage = window.location.pathname;
  const navLinks = document.querySelectorAll("header nav ul li a");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
}

function initializeMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("header nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      nav.classList.toggle("active");
      const icon = menuToggle.querySelector("i");
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    });
  }
}

function initializeSearchToggle() {
  const searchContainer = document.querySelector(".search-container");
  const searchToggle = document.getElementById("search-toggle");
  const searchInput = document.getElementById("search-input-header");
  const searchForm = document.getElementById("search-form");

  if (searchToggle && searchInput && searchContainer) {
    // Arahkan submit ke halaman pencarian yang benar
    searchForm.action = "/pencarian/";

    searchToggle.addEventListener("click", function (e) {
      e.preventDefault();
      const isExpanded = searchContainer.classList.contains("active");

      if (isExpanded && searchInput.value.trim() !== "") {
        searchForm.submit();
      } else {
        searchContainer.classList.toggle("active");
        if (searchContainer.classList.contains("active")) {
          searchInput.focus();
        }
      }
    });

    document.addEventListener("click", function (event) {
      if (searchContainer && !searchContainer.contains(event.target)) {
        searchContainer.classList.remove("active");
      }
    });
  }
}

window.initializeScrollAnimation = function () {
  const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
  if (!elementsToAnimate.length) return;

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

  elementsToAnimate.forEach((el) => {
    if (!el.classList.contains("visible")) {
      observer.observe(el);
    }
  });
};

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

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
