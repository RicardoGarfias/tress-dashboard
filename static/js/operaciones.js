/* operaciones.js — Lógica de la página Operaciones & ERP
   Carga KPIs, tarjetas de productos ERP, gráfica de ingresos e indicadores */


// Configuración visual compartida por las gráficas de esta página
const CHART_DEFAULTS = {
  font:      "DM Sans",
  tickColor: "#8899bb",
  gridColor: "#1f2d4a",
};

// Color asignado a cada categoría de producto en la gráfica de barras
const CAT_COLORS = {
  "Nómina":       "#3d7fff",
  "ERP":          "#00d4aa",
  "RRHH":         "#a855f7",
  "Finanzas":     "#f59e0b",
  "Ventas":       "#22c55e",
  "Inteligencia": "#f97316",
};


// ── KPIs del encabezado e indicadores de plataforma ─────────────────────────
async function loadOperacionesKPIs() {
  try {
    const res  = await fetch("/api/operaciones/kpis");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const k    = json.data;
    const f    = window.Tress;

    // Rellena las 4 tarjetas KPI superiores
    document.getElementById("kLicencias").textContent  = f.formatNum(k.total_licencias_activas);
    document.getElementById("kIngresos").textContent   = f.formatMXN(k.ingresos_anuales);
    document.getElementById("kRenovacion").textContent = f.formatPct(k.tasa_renovacion);
    document.getElementById("kClientes").textContent   = f.formatNum(k.clientes_activos);

    // Rellena los valores de texto en los indicadores de plataforma
    document.getElementById("indUptime").textContent  = `${k.uptime_plataforma}%`;
    document.getElementById("indNPS").textContent     = k.nps_score;
    document.getElementById("indTickets").textContent = k.soporte_tickets_abiertos;

    // Anima las barras de progreso con un pequeño retraso (200ms)
    // El retraso permite que el DOM esté listo antes de cambiar el width
    setTimeout(() => {
      document.getElementById("uptimeBar").style.width  = `${k.uptime_plataforma}%`;
      document.getElementById("npsBar").style.width     = `${k.nps_score}%`;
      // Los tickets se muestran como porcentaje sobre 100 tickets máximos
      document.getElementById("ticketsBar").style.width = `${Math.min((k.soporte_tickets_abiertos / 100) * 100, 100)}%`;
    }, 200);

  } catch (err) {
    console.error("loadOperacionesKPIs:", err);
    document.getElementById("kLicencias").textContent = "Error";
  }
}


// ── Tarjetas de productos ERP ────────────────────────────────────────────────
async function loadProductosERP() {
  const grid = document.getElementById("erpProductsGrid");
  try {
    const res  = await fetch("/api/operaciones/productos");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const f    = window.Tress;

    // Genera una tarjeta por cada producto
    grid.innerHTML = json.data.map((p) => {
      // Calcula la tasa de renovación de ese producto
      const tasa = ((p.renovaciones / p.licencias) * 100).toFixed(1);
      // Obtiene el color de la categoría (o azul por defecto)
      const col  = CAT_COLORS[p.categoria] || "#3d7fff";
      return `
        <div class="erp-card">
          <div class="erp-card-header">
            <div>
              <div class="erp-name">${p.nombre}</div>
              <div class="erp-id">${p.id}</div>
            </div>
            <!-- Badge coloreado con el color de la categoría -->
            <span class="badge" style="background:${col}22;color:${col}">${p.categoria}</span>
          </div>
          <div class="erp-metrics">
            <div class="erp-metric">
              <span class="erp-metric-label">Licencias</span>
              <span class="erp-metric-val">${f.formatNum(p.licencias)}</span>
            </div>
            <div class="erp-metric">
              <span class="erp-metric-label">Renovaciones</span>
              <span class="erp-metric-val">${f.formatNum(p.renovaciones)}</span>
            </div>
            <div class="erp-metric">
              <span class="erp-metric-label">Ingresos</span>
              <span class="erp-metric-val">${f.formatMXN(p.ingresos)}</span>
            </div>
          </div>
          <div class="mini-bar-label">
            <span>Tasa renovación</span><span>${tasa}%</span>
          </div>
          <!-- Mini barra de progreso; el ancho se anima con JS después del render -->
          <div class="mini-bar">
            <div class="mini-fill" data-target="${tasa}" style="background:${col}"></div>
          </div>
        </div>
      `;
    }).join("");

    // Anima todas las mini-barras: espera un frame de render antes de aplicar el ancho
    // (si se aplica width antes del primer render, la animación CSS no se ve)
    requestAnimationFrame(() => {
      document.querySelectorAll(".mini-fill").forEach((el) => {
        const target = el.dataset.target;
        requestAnimationFrame(() => { el.style.width = `${target}%`; });
      });
    });

  } catch (err) {
    console.error("loadProductosERP:", err);
    grid.innerHTML = `<div class="error-msg">Error al cargar productos.</div>`;
  }
}


// ── Gráfica de barras apiladas: ingresos mensuales por producto ──────────────
async function loadChartIngresos() {
  try {
    const res  = await fetch("/api/operaciones/ingresos-mensuales");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const { meses, data } = json.data; // meses = ["Ene","Feb",...], data = array de productos

    const palette = ["#3d7fff","#00d4aa","#a855f7","#f59e0b","#22c55e","#f97316"];

    // Convierte cada producto en un dataset de Chart.js
    const datasets = data.map((item, i) => ({
      label:           item.producto,
      data:            item.valores,
      backgroundColor: palette[i % palette.length], // Cicla los colores si hay más de 6 productos
      borderRadius:    4,
      borderSkipped:   false,
    }));

    new Chart(document.getElementById("chartIngresos"), {
      type: "bar",
      data: { labels: meses, datasets },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color:    CHART_DEFAULTS.tickColor,
              font:     { family: CHART_DEFAULTS.font, size: 11 },
              padding:  12,
              boxWidth: 12,
            },
          },
        },
        scales: {
          x: {
            stacked: true, // Las barras se apilan en vez de estar una al lado de la otra
            grid:    { color: CHART_DEFAULTS.gridColor },
            ticks:   { color: CHART_DEFAULTS.tickColor, font: { family: CHART_DEFAULTS.font } },
          },
          y: {
            stacked: true,
            grid:    { color: CHART_DEFAULTS.gridColor },
            ticks: {
              color:    CHART_DEFAULTS.tickColor,
              font:     { family: CHART_DEFAULTS.font },
              callback: (v) => `${v}K`, // Muestra el valor en miles: 1500 → "1500K"
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("loadChartIngresos:", err);
  }
}


// ── Inicio: carga todo al abrir la página ───────────────────────────────────
loadOperacionesKPIs();
loadProductosERP();
loadChartIngresos();
