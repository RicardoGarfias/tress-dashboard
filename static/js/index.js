/* ── index.js — Página de Inicio ─────────────────────────── */

async function loadHeroCards() {
  try {
    const [resEl, kpisEl] = await Promise.all([
      fetch("/api/reportes/resumen-ejecutivo"),
      fetch("/api/operaciones/kpis"),
    ]);

    if (!resEl.ok || !kpisEl.ok) throw new Error("Error API");

    const res  = await resEl.json();
    const kpis = await kpisEl.json();

    const r = res.data;
    const k = kpis.data;
    const f = window.Tress;

    // Hero cards
    document.getElementById("heroEmpleados").querySelector(".hc-value").textContent =
      f.formatNum(r.empleados_totales);
    document.getElementById("heroIngresos").querySelector(".hc-value").textContent =
      f.formatMXN(r.ingresos_ytd);
    document.getElementById("heroClientes").querySelector(".hc-value").textContent =
      f.formatNum(k.clientes_activos);
    document.getElementById("heroUptime").querySelector(".hc-value").textContent =
      f.formatPct(k.uptime_plataforma);

    // KPI strip
    document.getElementById("masaSalarial").textContent  = f.formatMXN(r.ingresos_ytd / 5);
    document.getElementById("crecimiento").textContent   = `+${f.formatPct(r.crecimiento_yoy)}`;
    document.getElementById("npsScore").textContent      = k.nps_score;
    document.getElementById("ticketsAbiertos").textContent = k.soporte_tickets_abiertos;

  } catch (err) {
    console.error("loadHeroCards:", err);
    document.getElementById("heroEmpleados").querySelector(".hc-value").textContent = "Error";
  }
}

async function loadProducts() {
  const grid = document.getElementById("productsGrid");
  try {
    const res  = await fetch("/api/operaciones/productos");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const f    = window.Tress;

    grid.innerHTML = json.data.map((p) => `
      <div class="product-card">
        <div class="pc-cat">${p.categoria}</div>
        <div class="pc-name">${p.nombre}</div>
        <div class="pc-stats">
          <div class="pc-stat">
            <span class="pc-stat-label">Licencias</span>
            <span class="pc-stat-val">${f.formatNum(p.licencias)}</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-label">Renovaciones</span>
            <span class="pc-stat-val">${f.formatNum(p.renovaciones)}</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-label">Ingresos</span>
            <span class="pc-stat-val">${f.formatMXN(p.ingresos)}</span>
          </div>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error("loadProducts:", err);
    grid.innerHTML = `<div class="error-msg">Error al cargar productos.</div>`;
  }
}

// Init
loadHeroCards();
loadProducts();
