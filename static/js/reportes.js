/* reportes.js — Lógica de la página Reportes Ejecutivos
   Carga el resumen ejecutivo, gráfica de satisfacción y gráfica + tabla de tickets */


// Configuración visual compartida por las gráficas de esta página
const CHART_DEFAULTS = {
  font:      "DM Sans",
  tickColor: "#8899bb",
  gridColor: "#1f2d4a",
};


// ── Resumen ejecutivo y barra de meta anual ───────────────────────────────────
async function loadResumenEjecutivo() {
  try {
    const res  = await fetch("/api/reportes/resumen-ejecutivo");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const d    = json.data;
    const f    = window.Tress;

    // Define las 4 tarjetas del grid ejecutivo con sus etiquetas y valores
    const cards = [
      { label: "Ingresos YTD",    value: f.formatMXN(d.ingresos_ytd),          sub: `Meta: ${f.formatMXN(d.meta_anual)}` },
      { label: "Clientes Nuevos", value: d.clientes_nuevos_ytd,                 sub: `Churn: ${f.formatPct(d.churn_rate)}` },
      { label: "Crecimiento YoY", value: `+${f.formatPct(d.crecimiento_yoy)}`,  sub: "vs. año anterior" },
      { label: "EBITDA Margen",   value: f.formatPct(d.ebitda_margen),          sub: `${d.empleados_totales} empleados` },
    ];

    // Genera el HTML de las tarjetas e inserta en el grid
    document.getElementById("execGrid").innerHTML = cards.map((c) => `
      <div class="exec-card">
        <div class="exec-label">${c.label}</div>
        <div class="exec-value">${c.value}</div>
        <div class="exec-sub">${c.sub}</div>
      </div>
    `).join("");

    // Rellena los textos de la barra de progreso de meta anual
    document.getElementById("metaPct").textContent    = `${d.cumplimiento_meta}%`;
    document.getElementById("metaActual").textContent = f.formatMXN(d.ingresos_ytd);
    document.getElementById("metaAnual").textContent  = f.formatMXN(d.meta_anual);

    // Anima el ancho de la barra después de 200ms (necesario para que la transición CSS se vea)
    setTimeout(() => {
      document.getElementById("metaFill").style.width = `${d.cumplimiento_meta}%`;
    }, 200);

  } catch (err) {
    console.error("loadResumenEjecutivo:", err);
    document.getElementById("execGrid").innerHTML = `<div class="error-msg">Error al cargar resumen.</div>`;
  }
}


// ── Gráfica de pastel: satisfacción de clientes ──────────────────────────────
async function loadChartSatisfaccion() {
  try {
    const res  = await fetch("/api/reportes/satisfaccion-clientes");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();

    // Extrae las etiquetas (categorías) y los valores (porcentajes) del JSON
    const labels = json.data.map((d) => d.categoria);
    const values = json.data.map((d) => d.porcentaje);
    // Verde = muy satisfecho, azul = satisfecho, amarillo = neutral, naranja = insatisfecho, rojo = muy insatisfecho
    const colors = ["#22c55e","#3d7fff","#f59e0b","#f97316","#ef4444"];

    new Chart(document.getElementById("chartSatisfaccion"), {
      type: "pie", // Gráfica de pastel (cada rebanada = un nivel de satisfacción)
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
            position: "bottom", // Leyenda debajo del pastel
            labels: {
              color:    CHART_DEFAULTS.tickColor,
              font:     { family: CHART_DEFAULTS.font, size: 12 },
              padding:  12,
              boxWidth: 12,
            },
          },
          tooltip: {
            callbacks: {
              // Personaliza el tooltip: "Satisfecho: 31%"
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


// ── Gráfica de barras + tabla: tickets de soporte por módulo ─────────────────
async function loadChartTickets() {
  const tbody = document.getElementById("tbodyTickets");
  try {
    const res  = await fetch("/api/reportes/tickets-soporte");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const data = json.data;

    // Separa los datos en arreglos para la gráfica
    const labels   = data.map((d) => d.modulo);   // Nombres de módulos (eje X)
    const cerrados = data.map((d) => d.cerrados);  // Tickets resueltos
    const abiertos = data.map((d) => d.abiertos);  // Tickets pendientes

    // Gráfica de barras agrupadas: verde = cerrados, rojo = abiertos
    new Chart(document.getElementById("chartTickets"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label:           "Cerrados",
            data:            cerrados,
            backgroundColor: "#22c55e", // Verde
            borderRadius:    4,
            borderSkipped:   false,
          },
          {
            label:           "Abiertos",
            data:            abiertos,
            backgroundColor: "#ef4444", // Rojo
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

    // ── Tabla de detalle bajo la gráfica ────────────────────────────────────
    tbody.innerHTML = data.map((d) => {
      const total = d.abiertos + d.cerrados;
      // Eficiencia = porcentaje de tickets resueltos del total
      const eff   = total > 0 ? ((d.cerrados / total) * 100).toFixed(1) : 0;
      return `
        <tr>
          <td>${d.modulo}</td>
          <td><span class="badge badge-red">${d.abiertos}</span></td>
          <td><span class="badge badge-green">${d.cerrados}</span></td>
          <td>${d.promedio_horas}h</td>
          <td>
            <!-- Mini barra de eficiencia: más larga = más tickets resueltos -->
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


// ── Inicio: carga todo al abrir la página ───────────────────────────────────
loadResumenEjecutivo();
loadChartSatisfaccion();
loadChartTickets();
