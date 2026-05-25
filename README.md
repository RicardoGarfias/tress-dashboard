
# 🏢 Tress International Dashboard

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.1-lightgrey?style=flat-square&logo=flask)
![HTML5](https://img.shields.io/badge/HTML5-CSS3-orange?style=flat-square&logo=html5)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=flat-square&logo=javascript)
![License](https://img.shields.io/badge/Licencia-Académica-green?style=flat-square)

> Dashboard empresarial desarrollado con Flask (Python), inspirado en
> Grupo Tress International — empresa líder en soluciones de nómina,
> RRHH y ERP en México y Latinoamérica.

---

## 📌 Descripción

Este proyecto es una aplicación web full-stack que simula el panel de
control interno de una empresa de software empresarial. Fue desarrollado
como proyecto académico para demostrar el uso de:

- Frameworks backend con Python (Flask)
- Desarrollo de APIs REST propias
- Integración de tecnologías frontend (HTML, CSS, JavaScript)
- Visualización de datos con gráficas interactivas
- Arquitectura de proyectos web modernos

---

## 🖥️ Vista del Sistema

| Sección       | Descripción                                      |
|---------------|--------------------------------------------------|
| Inicio        | KPIs globales, módulos ERP, accesos rápidos      |
| Nómina & RRHH | Directorio de empleados, gráficas, filtros       |
| Operaciones   | Portafolio de productos, ingresos, indicadores   |
| Reportes      | Resumen ejecutivo, satisfacción, soporte         |

---

## 🚀 Instalación y uso

\`\`\`bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/tress-dashboard.git
cd tress-dashboard

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate      # Linux / Mac
venv\Scripts\activate         # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar la aplicación
python app.py
\`\`\`

Abrir en el navegador: **http://localhost:5000**

---

## 🗂️ Estructura del Proyecto

\`\`\`
tress_dashboard/
├── app.py                  ← Aplicación Flask principal
├── requirements.txt        ← Dependencias
├── api/
│   ├── __init__.py
│   └── routes.py           ← API REST (Blueprint Flask)
├── static/
│   ├── css/
│   │   └── main.css        ← Estilos globales (tema oscuro)
│   └── js/
│       ├── main.js         ← JavaScript global
│       ├── index.js
│       ├── nomina.js
│       ├── operaciones.js
│       └── reportes.js
└── templates/
    ├── base.html           ← Template base con sidebar
    ├── index.html
    ├── nomina.html
    ├── operaciones.html
    ├── reportes.html
    ├── 404.html
    └── 500.html
\`\`\`

---

## 🔌 API REST Propia

La aplicación incluye una API propia desarrollada con Flask Blueprints.

**Base URL:** \`/api\`

| Endpoint                              | Método | Descripción                        |
|---------------------------------------|--------|------------------------------------|
| \`/api/health\`                         | GET    | Estado de la API                   |
| \`/api/nomina/resumen\`                  | GET    | KPIs generales de nómina           |
| \`/api/nomina/empleados\`                | GET    | Lista de empleados (con filtros)   |
| \`/api/nomina/distribucion-deptos\`      | GET    | Empleados por departamento         |
| \`/api/nomina/historico-masa-salarial\`  | GET    | Serie mensual de masa salarial     |
| \`/api/operaciones/productos\`           | GET    | Portafolio de productos ERP        |
| \`/api/operaciones/kpis\`                | GET    | KPIs operativos globales           |
| \`/api/operaciones/ingresos-mensuales\`  | GET    | Ingresos por producto (6 meses)    |
| \`/api/reportes/satisfaccion-clientes\`  | GET    | Encuesta de satisfacción           |
| \`/api/reportes/tickets-soporte\`        | GET    | Tickets por módulo                 |
| \`/api/reportes/resumen-ejecutivo\`      | GET    | Resumen ejecutivo YTD              |

---

## 🛠️ Tecnologías utilizadas

**Backend**
- Python 3.11
- Flask 3.1 (framework web)
- Flask Blueprints (modularización de la API)
- Jinja2 (motor de plantillas HTML)

**Frontend**
- HTML5 semántico
- CSS3 con variables y animaciones
- JavaScript ES6+ (Fetch API, async/await)
- Chart.js 4.4 (gráficas interactivas)
- Google Fonts: Syne + DM Sans

**Visualizaciones**
- Gráfica Doughnut — distribución de empleados
- Gráfica Line — historial de masa salarial
- Gráfica Bar apilada — ingresos por producto
- Gráfica Pie — satisfacción de clientes
- Barras de progreso animadas — indicadores

---

## 📊 Funcionalidades destacadas

- ✅ Dashboard con 4 secciones completamente funcionales
- ✅ API REST propia con 11 endpoints JSON documentados
- ✅ Tabla de empleados con filtros dinámicos (sin recarga)
- ✅ KPIs en tiempo real consumidos desde la API
- ✅ 5 tipos de gráficas interactivas con Chart.js
- ✅ Sidebar responsive con toggle para móviles
- ✅ Indicador de estado de la API en tiempo real
- ✅ Manejo de errores 404 y 500
- ✅ Tema oscuro corporativo con CSS variables
- ✅ Datos ficticios coherentes con una empresa de software

---

## 🔒 Investigación complementaria

El proyecto incluye investigación sobre:

- **Testing en Python** — pytest, unittest, Flask Test Client
- **Seguridad web** — OWASP Top 10, validación, CSRF, XSS
- **CI/CD** — Integración continua, despliegue en Heroku/Render

Ver archivo: \`DOCUMENTACION.md\`

---

## 👨‍💻 Autor

Desarrollado como proyecto académico.
Inspirado en [Grupo Tress International](https://www.tress.com.mx) —
empresa de Tijuana, B.C., líder en soluciones HCM para México y LATAM.

---

## 📄 Licencia

Proyecto académico — uso educativo únicamente.
Los datos mostrados son ficticios y no representan información real de ninguna empresa.

