/* index.js — Lógica de la página de Inicio
   Carga datos de la API y los muestra en las tarjetas y la cuadrícula de productos */


// Carga los KPIs del hero y el strip superior
async function loadHeroCards() {
  try {
    // Hace DOS peticiones al mismo tiempo para ser más rápido (Promise.all)
    const [resEl, kpisEl] = await Promise.all([
      fetch("/api/reportes/resumen-ejecutivo"), // Datos generales del negocio
      fetch("/api/operaciones/kpis"),           // Datos de operaciones
    ]);

    if (!resEl.ok || !kpisEl.ok) throw new Error("Error API");

    const res  = await resEl.json();
    const kpis = await kpisEl.json();

    const r = res.data;   // Datos del resumen ejecutivo
    const k = kpis.data;  // Datos de operaciones
    const f = window.Tress; // Funciones de formato de main.js

    // Rellena las 4 tarjetas flotantes del hero con los datos de la API
    document.getElementById("heroEmpleados").querySelector(".hc-value").textContent =
      f.formatNum(r.empleados_totales);
    document.getElementById("heroIngresos").querySelector(".hc-value").textContent =
      f.formatMXN(r.ingresos_ytd);
    document.getElementById("heroClientes").querySelector(".hc-value").textContent =
      f.formatNum(k.clientes_activos);
    document.getElementById("heroUptime").querySelector(".hc-value").textContent =
      f.formatPct(k.uptime_plataforma);

    // Rellena el strip de KPIs debajo del hero
    document.getElementById("masaSalarial").textContent    = f.formatMXN(r.ingresos_ytd / 5);
    document.getElementById("crecimiento").textContent     = `+${f.formatPct(r.crecimiento_yoy)}`;
    document.getElementById("npsScore").textContent        = k.nps_score;
    document.getElementById("ticketsAbiertos").textContent = k.soporte_tickets_abiertos;

  } catch (err) {
    console.error("loadHeroCards:", err);
    // Si hay error, muestra "Error" en lugar de datos
    document.getElementById("heroEmpleados").querySelector(".hc-value").textContent = "Error";
  }
}


// Carga y pinta la cuadrícula de productos ERP
async function loadProducts() {
  const grid = document.getElementById("productsGrid");
  try {
    const res  = await fetch("/api/operaciones/productos");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const f    = window.Tress;

    // Por cada producto, genera una tarjeta HTML y la inserta en el grid
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
    `).join(""); // .join("") une todos los strings sin separador

  } catch (err) {
    console.error("loadProducts:", err);
    grid.innerHTML = `<div class="error-msg">Error al cargar productos.</div>`;
  }
}


// ── Inicio: ejecuta ambas funciones al cargar la página ─────────────────────
loadHeroCards();
loadProducts();
