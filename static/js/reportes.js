/* ── reportes.js — Reportes Ejecutivos ───────────────────── */

const CHART_DEFAULTS = {
  font:      "DM Sans",
  tickColor: "#8899bb",
  gridColor: "#1f2d4a",
};

async function loadResumenEjecutivo() {
  try {
    const res  = await fetch("/api/reportes/resumen-ejecutivo");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const d    = json.data;
    const f    = window.Tress;

    const cards = [
      { label: "Ingresos YTD",     value: f.formatMXN(d.ingresos_ytd),   sub: `Meta: ${f.formatMXN(d.meta_anual)}` },
      { label: "Clientes Nuevos",  value: d.clientes_nuevos_ytd,          sub: `Churn: ${f.formatPct(d.churn_rate)}` },
      { label: "Crecimiento YoY",  value: `+${f.formatPct(d.crecimiento_yoy)}`, sub: "vs. año anterior" },
      { label: "EBITDA Margen",    value: f.formatPct(d.ebitda_margen),   sub: `${d.empleados_totales} empleados` },
    ];

    document.getElementById("execGrid").innerHTML = cards.map((c) => `
      <div class="exec-card">
        <div class="exec-label">${c.label}</div>
        <div class="exec-value">${c.value}</div>
        <div class="exec-sub">${c.sub}</div>
      </div>
    `).join("");

    // Meta bar
    document.getElementById("metaPct").textContent    = `${d.cumplimiento_meta}%`;
    document.getElementById("metaActual").textContent = f.formatMXN(d.ingresos_ytd);
    document.getElementById("metaAnual").textContent  = f.formatMXN(d.meta_anual);

    setTimeout(() => {
      document.getElementById("metaFill").style.width = `${d.cumplimiento_meta}%`;
    }, 200);

  } catch (err) {
    console.error("loadResumenEjecutivo:", err);
    document.getElementById("execGrid").innerHTML = `<div class="error-msg">Error al cargar resumen.</div>`;
  }
}

async function loadChartSatisfaccion() {
  try {
    const res  = await fetch("/api/reportes/satisfaccion-clientes");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();

    const labels = json.data.map((d) => d.categoria);
    const values = json.data.map((d) => d.porcentaje);
    const colors = ["#22c55e","#3d7fff","#f59e0b","#f97316","#ef4444"];

    new Chart(document.getElementById("chartSatisfaccion"), {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data:            values,
          backgroundColor: colors,
          borderWidth:     0,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color:    CHART_DEFAULTS.tickColor,
              font:     { family: CHART_DEFAULTS.font, size: 12 },
              padding:  12,
              boxWidth: 12,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("loadChartSatisfaccion:", err);
  }
}

async function loadChartTickets() {
  const tbody = document.getElementById("tbodyTickets");
  try {
    const res  = await fetch("/api/reportes/tickets-soporte");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const data = json.data;

    const labels   = data.map((d) => d.modulo);
    const cerrados = data.map((d) => d.cerrados);
    const abiertos = data.map((d) => d.abiertos);

    new Chart(document.getElementById("chartTickets"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label:           "Cerrados",
            data:            cerrados,
            backgroundColor: "#22c55e",
            borderRadius:    4,
            borderSkipped:   false,
          },
          {
            label:           "Abiertos",
            data:            abiertos,
            backgroundColor: "#ef4444",
            borderRadius:    4,
            borderSkipped:   false,
          },
        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: CHART_DEFAULTS.tickColor,
              font:  { family: CHART_DEFAULTS.font },
            },
          },
        },
        scales: {
          x: {
            grid:  { color: CHART_DEFAULTS.gridColor },
            ticks: { color: CHART_DEFAULTS.tickColor, font: { family: CHART_DEFAULTS.font } },
          },
          y: {
            grid:  { color: CHART_DEFAULTS.gridColor },
            ticks: { color: CHART_DEFAULTS.tickColor, font: { family: CHART_DEFAULTS.font } },
          },
        },
      },
    });

    // Tabla
    tbody.innerHTML = data.map((d) => {
      const total = d.abiertos + d.cerrados;
      const eff   = total > 0 ? ((d.cerrados / total) * 100).toFixed(1) : 0;
      return `
        <tr>
          <td>${d.modulo}</td>
          <td><span class="badge badge-red">${d.abiertos}</span></td>
          <td><span class="badge badge-green">${d.cerrados}</span></td>
          <td>${d.promedio_horas}h</td>
          <td>
            <div class="eff-bar-wrap">
              <div class="eff-bar-bg">
                <div class="eff-bar-fill" style="width:${eff}%"></div>
              </div>
              <span class="eff-pct">${eff}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join("");

  } catch (err) {
    console.error("loadChartTickets:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="error-msg">Error al cargar tickets.</td></tr>`;
  }
}

// Init
loadResumenEjecutivo();
loadChartSatisfaccion();
loadChartTickets();
