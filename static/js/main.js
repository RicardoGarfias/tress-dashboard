/* ── main.js — Global utilities ──────────────────────────── */

// Date in Spanish
(function () {
  const el = document.getElementById("currentDate");
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleDateString("es-MX", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  }
})();

// Sidebar toggle (mobile)
(function () {
  const btn     = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;

  btn.addEventListener("click", () => sidebar.classList.toggle("open"));

  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      e.target !== btn
    ) {
      sidebar.classList.remove("open");
    }
  });
})();

// API health check
(function () {
  const status = document.getElementById("apiStatus");
  if (!status) return;

  fetch("/api/health")
    .then((r) => {
      if (!r.ok) throw new Error("not ok");
      return r.json();
    })
    .then(() => {
      status.classList.add("online");
      status.querySelector(".status-label").textContent = "API Online";
    })
    .catch(() => {
      status.classList.add("offline");
      status.querySelector(".status-label").textContent = "API Offline";
    });
})();

// Global formatting helpers
window.Tress = {
  formatMXN(n) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(n);
  },
  formatNum(n) {
    return new Intl.NumberFormat("es-MX").format(n);
  },
  formatPct(n) {
    return `${parseFloat(n).toFixed(1)}%`;
  },
};
