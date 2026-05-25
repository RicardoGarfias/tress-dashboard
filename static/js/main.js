/* main.js — Funciones globales que se ejecutan en TODAS las páginas
   Este archivo lo carga base.html, por eso está disponible en todo el dashboard */


// ── Fecha actual en el topbar ────────────────────────────────────────────────
// Se ejecuta inmediatamente (IIFE = función que se llama sola)
(function () {
  const el = document.getElementById("currentDate"); // Busca el elemento del topbar
  if (el) {
    const now = new Date();
    // Formatea la fecha en español mexicano: "lunes, 25 de mayo de 2026"
    el.textContent = now.toLocaleDateString("es-MX", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  }
})();


// ── Sidebar en móvil (botón hamburguesa) ─────────────────────────────────────
(function () {
  const btn     = document.getElementById("sidebarToggle"); // Botón ☰
  const sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;

  // Al hacer clic en ☰, agrega/quita la clase "open" que hace visible el sidebar
  btn.addEventListener("click", () => sidebar.classList.toggle("open"));

  // Si el usuario hace clic FUERA del sidebar, lo cierra automáticamente
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) && // El clic no fue dentro del sidebar
      e.target !== btn               // El clic no fue en el botón hamburguesa
    ) {
      sidebar.classList.remove("open");
    }
  });
})();


// ── Indicador de estado de la API (semáforo en el topbar) ───────────────────
(function () {
  const status = document.getElementById("apiStatus");
  if (!status) return;

  // Hace una petición al endpoint /api/health para saber si la API responde
  fetch("/api/health")
    .then((r) => {
      if (!r.ok) throw new Error("not ok");
      return r.json();
    })
    .then(() => {
      // Si la API respondió bien → punto verde + texto "API Online"
      status.classList.add("online");
      status.querySelector(".status-label").textContent = "API Online";
    })
    .catch(() => {
      // Si hubo error → punto rojo + texto "API Offline"
      status.classList.add("offline");
      status.querySelector(".status-label").textContent = "API Offline";
    });
})();


// ── Funciones de formato reutilizables ───────────────────────────────────────
// Se guardan en window.Tress para que index.js, nomina.js, etc. las puedan usar
window.Tress = {

  // Convierte un número a pesos mexicanos: 52000 → "$52,000"
  formatMXN(n) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(n);
  },

  // Formatea un número con separador de miles: 1200 → "1,200"
  formatNum(n) {
    return new Intl.NumberFormat("es-MX").format(n);
  },

  // Formatea un porcentaje con un decimal: 74.6 → "74.6%"
  formatPct(n) {
    return `${parseFloat(n).toFixed(1)}%`;
  },
};
