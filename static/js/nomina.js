/* ── nomina.js — Nómina & RRHH ───────────────────────────── */

const CHART_DEFAULTS = {
  font:       "DM Sans",
  tickColor:  "#8899bb",
  gridColor:  "#1f2d4a",
};

async function loadNominaKPIs() {
  try {
    const res  = await fetch("/api/nomina/resumen");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const d    = json.data;
    const f    = window.Tress;

    document.getElementById("kTotalEmp").textContent  = f.formatNum(d.total_empleados);
    document.getElementById("kMasa").textContent      = f.formatMXN(d.masa_salarial_mensual);
    document.getElementById("kNuevos").textContent    = d.nuevos_ingresos_mes;
    document.getElementById("kRotacion").textContent  = f.formatPct(d.rotacion_porcentaje);
  } catch (err) {
    console.error("loadNominaKPIs:", err);
    document.getElementById("kTotalEmp").textContent = "Error";
  }
}

async function loadEmpleados(depto = "", activo = "") {
  const tbody = document.getElementById("tbodyEmpleados");
  tbody.innerHTML = `<tr><td colspan="7" class="loading-msg">Cargando…</td></tr>`;
  try {
    const params = new URLSearchParams();
    if (depto)  params.set("depto",  depto);
    if (activo) params.set("activo", activo);

    const res  = await fetch(`/api/nomina/empleados?${params}`);
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const f    = window.Tress;

    if (!json.data.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="loading-msg">Sin resultados.</td></tr>`;
      return;
    }

    tbody.innerHTML = json.data.map((e, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${e.nombre}</td>
        <td>${e.puesto}</td>
        <td>${e.depto}</td>
        <td>${f.formatMXN(e.salario)}</td>
        <td>${e.ingreso}</td>
        <td><span class="badge ${e.activo ? "badge-green" : "badge-red"}">${e.activo ? "Activo" : "Inactivo"}</span></td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("loadEmpleados:", err);
    tbody.innerHTML = `<tr><td colspan="7" class="error-msg">Error al cargar empleados.</td></tr>`;
  }
}

async function loadChartDepto() {
  try {
    const res  = await fetch("/api/nomina/distribucion-deptos");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const dist = json.data;

    const labels = Object.keys(dist);
    const values = Object.values(dist);
    const colors = ["#3d7fff","#00d4aa","#f59e0b","#a855f7","#ef4444","#22c55e","#f97316"];

    new Chart(document.getElementById("chartDepto"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color:    CHART_DEFAULTS.tickColor,
              font:     { family: CHART_DEFAULTS.font, size: 12 },
              padding:  16,
              boxWidth: 12,
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("loadChartDepto:", err);
  }
}

async function loadChartMasaSalarial() {
  try {
    const res  = await fetch("/api/nomina/historico-masa-salarial");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const { meses, valores } = json.data;

    new Chart(document.getElementById("chartMasaSalarial"), {
      type: "line",
      data: {
        labels: meses,
        datasets: [{
          label:           "Masa Salarial (MXN)",
          data:            valores,
          borderColor:     "#3d7fff",
          backgroundColor: "rgba(61,127,255,0.1)",
          fill:            true,
          tension:         0.4,
          pointRadius:     4,
          pointBackgroundColor: "#3d7fff",
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: CHART_DEFAULTS.tickColor, font: { family: CHART_DEFAULTS.font } } },
        },
        scales: {
          x: {
            grid:  { color: CHART_DEFAULTS.gridColor },
            ticks: { color: CHART_DEFAULTS.tickColor, font: { family: CHART_DEFAULTS.font } },
          },
          y: {
            grid:  { color: CHART_DEFAULTS.gridColor },
            ticks: {
              color: CHART_DEFAULTS.tickColor,
              font:  { family: CHART_DEFAULTS.font },
              callback: (v) => `$${(v / 1000).toFixed(0)}K`,
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("loadChartMasaSalarial:", err);
  }
}

// Filtros
document.getElementById("btnFiltrar").addEventListener("click", () => {
  const depto  = document.getElementById("filterDepto").value;
  const activo = document.getElementById("filterActivo").value;
  loadEmpleados(depto, activo);
});

// Init
loadNominaKPIs();
loadEmpleados();
loadChartDepto();
loadChartMasaSalarial();
