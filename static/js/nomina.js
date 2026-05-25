/* nomina.js — Lógica de la página Nómina & RRHH
   Carga KPIs, tabla de empleados con filtros y dos gráficas */


// Configuración visual compartida por las dos gráficas de esta página
const CHART_DEFAULTS = {
  font:       "DM Sans",  // Fuente del texto en las gráficas
  tickColor:  "#8899bb",  // Color de los números/etiquetas de los ejes
  gridColor:  "#1f2d4a",  // Color de las líneas de la cuadrícula
};


// ── KPIs del encabezado ──────────────────────────────────────────────────────
async function loadNominaKPIs() {
  try {
    const res  = await fetch("/api/nomina/resumen"); // Pide el resumen a la API
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const d    = json.data;
    const f    = window.Tress;

    // Rellena cada tarjeta KPI con el valor correspondiente
    document.getElementById("kTotalEmp").textContent  = f.formatNum(d.total_empleados);
    document.getElementById("kMasa").textContent      = f.formatMXN(d.masa_salarial_mensual);
    document.getElementById("kNuevos").textContent    = d.nuevos_ingresos_mes;
    document.getElementById("kRotacion").textContent  = f.formatPct(d.rotacion_porcentaje);
  } catch (err) {
    console.error("loadNominaKPIs:", err);
    document.getElementById("kTotalEmp").textContent = "Error";
  }
}


// ── Tabla de empleados ───────────────────────────────────────────────────────
// depto y activo son los filtros seleccionados en el select (pueden estar vacíos)
async function loadEmpleados(depto = "", activo = "") {
  const tbody = document.getElementById("tbodyEmpleados");
  tbody.innerHTML = `<tr><td colspan="7" class="loading-msg">Cargando…</td></tr>`;

  try {
    // Construye los parámetros de la URL: ?depto=TI&activo=true
    const params = new URLSearchParams();
    if (depto)  params.set("depto",  depto);
    if (activo) params.set("activo", activo);

    const res  = await fetch(`/api/nomina/empleados?${params}`);
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const f    = window.Tress;

    // Si no hay resultados, muestra un mensaje
    if (!json.data.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="loading-msg">Sin resultados.</td></tr>`;
      return;
    }

    // Por cada empleado genera una fila <tr> con sus datos
    tbody.innerHTML = json.data.map((e, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${e.nombre}</td>
        <td>${e.puesto}</td>
        <td>${e.depto}</td>
        <td>${f.formatMXN(e.salario)}</td>
        <td>${e.ingreso}</td>
        <!-- Badge verde si está activo, rojo si no -->
        <td><span class="badge ${e.activo ? "badge-green" : "badge-red"}">${e.activo ? "Activo" : "Inactivo"}</span></td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("loadEmpleados:", err);
    tbody.innerHTML = `<tr><td colspan="7" class="error-msg">Error al cargar empleados.</td></tr>`;
  }
}


// ── Gráfica de dona: distribución de empleados por departamento ──────────────
async function loadChartDepto() {
  try {
    const res  = await fetch("/api/nomina/distribucion-deptos");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const dist = json.data; // Ej: { "TI": 4, "Ventas": 2, ... }

    const labels = Object.keys(dist);   // Nombres de departamentos
    const values = Object.values(dist); // Cantidad de empleados por depto
    const colors = ["#3d7fff","#00d4aa","#f59e0b","#a855f7","#ef4444","#22c55e","#f97316"];

    // Crea la gráfica de dona con Chart.js
    new Chart(document.getElementById("chartDepto"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data:            values,
          backgroundColor: colors.slice(0, labels.length), // Un color por departamento
          borderWidth:     0, // Sin borde entre segmentos
        }],
      },
      options: {
        responsive:          true,  // Se adapta al tamaño del contenedor
        maintainAspectRatio: false, // Usa el alto del contenedor CSS
        cutout: "65%",              // Tamaño del hueco central de la dona
        plugins: {
          legend: {
            position: "right", // Leyenda a la derecha de la dona
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


// ── Gráfica de línea: evolución de la masa salarial en 12 meses ─────────────
async function loadChartMasaSalarial() {
  try {
    const res  = await fetch("/api/nomina/historico-masa-salarial");
    if (!res.ok) throw new Error("Error API");
    const json = await res.json();
    const { meses, valores } = json.data; // Desestructura meses y valores del JSON

    new Chart(document.getElementById("chartMasaSalarial"), {
      type: "line",
      data: {
        labels: meses,
        datasets: [{
          label:           "Masa Salarial (MXN)",
          data:            valores,
          borderColor:     "#3d7fff",             // Color de la línea
          backgroundColor: "rgba(61,127,255,0.1)", // Área bajo la línea (semitransparente)
          fill:            true,    // Rellena el área bajo la curva
          tension:         0.4,     // Suaviza la línea (0 = recta, 1 = muy curva)
          pointRadius:     4,       // Tamaño de los puntos en cada mes
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
              // Muestra los valores en miles: 480000 → "$480K"
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


// ── Botón "Filtrar" ──────────────────────────────────────────────────────────
// Cuando el usuario hace clic, recarga la tabla con los filtros seleccionados
document.getElementById("btnFiltrar").addEventListener("click", () => {
  const depto  = document.getElementById("filterDepto").value;
  const activo = document.getElementById("filterActivo").value;
  loadEmpleados(depto, activo);
});


// ── Inicio: carga todo al abrir la página ───────────────────────────────────
loadNominaKPIs();
loadEmpleados();      // Sin filtros, carga todos los empleados
loadChartDepto();
loadChartMasaSalarial();
