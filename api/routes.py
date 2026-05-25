from flask import Blueprint, jsonify, request

api_bp = Blueprint("api", __name__)

# ── Datos ficticios ──────────────────────────────────────────────────────────

EMPLEADOS = [
    {"id": 1,  "nombre": "Alejandro Ríos",      "puesto": "Gerente de Nómina",       "depto": "Nómina",       "salario": 52000, "activo": True,  "ingreso": "2019-03-15"},
    {"id": 2,  "nombre": "Mariana Castillo",     "puesto": "Analista RRHH",           "depto": "RRHH",         "salario": 34000, "activo": True,  "ingreso": "2020-07-01"},
    {"id": 3,  "nombre": "Roberto Fuentes",      "puesto": "Desarrollador Senior",    "depto": "TI",           "salario": 62000, "activo": True,  "ingreso": "2018-11-20"},
    {"id": 4,  "nombre": "Lucía Peña",           "puesto": "Ejecutiva de Ventas",     "depto": "Ventas",       "salario": 38000, "activo": True,  "ingreso": "2021-02-10"},
    {"id": 5,  "nombre": "Carlos Medina",        "puesto": "Contador General",        "depto": "Finanzas",     "salario": 45000, "activo": True,  "ingreso": "2017-06-05"},
    {"id": 6,  "nombre": "Sofía Torres",         "puesto": "Gerente de Proyectos",    "depto": "TI",           "salario": 58000, "activo": True,  "ingreso": "2020-01-14"},
    {"id": 7,  "nombre": "Diego Morales",        "puesto": "Soporte Técnico",         "depto": "Soporte",      "salario": 28000, "activo": True,  "ingreso": "2022-05-03"},
    {"id": 8,  "nombre": "Valeria Guzmán",       "puesto": "Diseñadora UX",           "depto": "TI",           "salario": 40000, "activo": False, "ingreso": "2021-09-20"},
    {"id": 9,  "nombre": "Ernesto Salinas",      "puesto": "Director Comercial",      "depto": "Ventas",       "salario": 85000, "activo": True,  "ingreso": "2016-04-01"},
    {"id": 10, "nombre": "Daniela Herrera",      "puesto": "Analista de Datos",       "depto": "TI",           "salario": 42000, "activo": True,  "ingreso": "2023-01-09"},
    {"id": 11, "nombre": "Héctor Villanueva",    "puesto": "Especialista en Nómina",  "depto": "Nómina",       "salario": 35000, "activo": False, "ingreso": "2020-08-17"},
    {"id": 12, "nombre": "Gabriela Montoya",     "puesto": "Coordinadora de RRHH",    "depto": "RRHH",         "salario": 38000, "activo": True,  "ingreso": "2019-12-03"},
]

PRODUCTOS = [
    {"id": "TRS-NOM", "nombre": "Tress Nómina",         "categoria": "Nómina",       "licencias": 480, "renovaciones": 432, "ingresos": 9600000},
    {"id": "TRS-ERP", "nombre": "Tress ERP Core",       "categoria": "ERP",          "licencias": 210, "renovaciones": 195, "ingresos": 18900000},
    {"id": "TRS-HCM", "nombre": "Tress HCM",            "categoria": "RRHH",         "licencias": 320, "renovaciones": 298, "ingresos": 7680000},
    {"id": "TRS-CNT", "nombre": "Tress Contabilidad",   "categoria": "Finanzas",     "licencias": 155, "renovaciones": 140, "ingresos": 4650000},
    {"id": "TRS-CRM", "nombre": "Tress CRM",            "categoria": "Ventas",       "licencias": 98,  "renovaciones": 82,  "ingresos": 2940000},
    {"id": "TRS-BIA", "nombre": "Tress BI & Analytics", "categoria": "Inteligencia", "licencias": 74,  "renovaciones": 60,  "ingresos": 3700000},
]

INGRESOS_MENSUALES = {
    "meses": ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    "data": [
        {"producto": "Tress Nómina",         "categoria": "Nómina",       "valores": [780, 800, 820, 790, 810, 850]},
        {"producto": "Tress ERP Core",       "categoria": "ERP",          "valores": [1500, 1550, 1520, 1600, 1580, 1620]},
        {"producto": "Tress HCM",            "categoria": "RRHH",         "valores": [620, 640, 630, 660, 650, 680]},
        {"producto": "Tress Contabilidad",   "categoria": "Finanzas",     "valores": [370, 380, 385, 390, 400, 395]},
        {"producto": "Tress CRM",            "categoria": "Ventas",       "valores": [230, 240, 235, 250, 245, 260]},
        {"producto": "Tress BI & Analytics", "categoria": "Inteligencia", "valores": [290, 300, 310, 305, 320, 315]},
    ],
}

SATISFACCION = [
    {"categoria": "Muy Satisfecho",      "porcentaje": 42},
    {"categoria": "Satisfecho",          "porcentaje": 31},
    {"categoria": "Neutral",             "porcentaje": 14},
    {"categoria": "Insatisfecho",        "porcentaje": 9},
    {"categoria": "Muy Insatisfecho",    "porcentaje": 4},
]

TICKETS = [
    {"modulo": "Nómina",       "abiertos": 12, "cerrados": 88,  "promedio_horas": 3.2},
    {"modulo": "ERP Core",     "abiertos": 8,  "cerrados": 114, "promedio_horas": 5.7},
    {"modulo": "HCM",          "abiertos": 15, "cerrados": 72,  "promedio_horas": 4.1},
    {"modulo": "Contabilidad", "abiertos": 6,  "cerrados": 53,  "promedio_horas": 2.8},
    {"modulo": "CRM",          "abiertos": 19, "cerrados": 61,  "promedio_horas": 6.3},
]

# ── Endpoints ────────────────────────────────────────────────────────────────

@api_bp.route("/health")
def health():
    return jsonify({"status": "ok", "data": {"service": "Tress Dashboard API", "version": "2.4.1"}})


# — Nómina —

@api_bp.route("/nomina/resumen")
def nomina_resumen():
    activos = sum(1 for e in EMPLEADOS if e["activo"])
    return jsonify({"status": "ok", "data": {
        "total_empleados": len(EMPLEADOS),
        "masa_salarial_mensual": sum(e["salario"] for e in EMPLEADOS if e["activo"]),
        "nuevos_ingresos_mes": 2,
        "bajas_mes": 1,
        "rotacion_porcentaje": round((1 / activos) * 100, 2),
    }})


@api_bp.route("/nomina/empleados")
def nomina_empleados():
    depto  = request.args.get("depto", "").strip()
    activo = request.args.get("activo", "").strip().lower()
    result = EMPLEADOS[:]
    if depto:
        result = [e for e in result if e["depto"].lower() == depto.lower()]
    if activo in ("true", "false"):
        flag = activo == "true"
        result = [e for e in result if e["activo"] == flag]
    return jsonify({"status": "ok", "data": result})


@api_bp.route("/nomina/distribucion-deptos")
def nomina_dist_deptos():
    dist = {}
    for e in EMPLEADOS:
        if e["activo"]:
            dist[e["depto"]] = dist.get(e["depto"], 0) + 1
    return jsonify({"status": "ok", "data": dist})


@api_bp.route("/nomina/historico-masa-salarial")
def nomina_historico():
    meses  = ["Jun-24","Jul-24","Ago-24","Sep-24","Oct-24","Nov-24",
               "Dic-24","Ene-25","Feb-25","Mar-25","Abr-25","May-25"]
    valores = [480000,492000,488000,510000,505000,520000,
               518000,532000,528000,545000,541000,558000]
    return jsonify({"status": "ok", "data": {"meses": meses, "valores": valores}})


# — Operaciones —

@api_bp.route("/operaciones/productos")
def operaciones_productos():
    return jsonify({"status": "ok", "data": PRODUCTOS})


@api_bp.route("/operaciones/kpis")
def operaciones_kpis():
    total_lic = sum(p["licencias"] for p in PRODUCTOS)
    total_ren = sum(p["renovaciones"] for p in PRODUCTOS)
    return jsonify({"status": "ok", "data": {
        "total_licencias_activas": total_lic,
        "ingresos_anuales":        sum(p["ingresos"] for p in PRODUCTOS),
        "tasa_renovacion":         round((total_ren / total_lic) * 100, 1),
        "clientes_activos":        340,
        "soporte_tickets_abiertos": sum(t["abiertos"] for t in TICKETS),
        "uptime_plataforma":       99.7,
        "nps_score":               72,
    }})


@api_bp.route("/operaciones/ingresos-mensuales")
def operaciones_ingresos():
    return jsonify({"status": "ok", "data": INGRESOS_MENSUALES})


# — Reportes —

@api_bp.route("/reportes/satisfaccion-clientes")
def reportes_satisfaccion():
    return jsonify({"status": "ok", "data": SATISFACCION})


@api_bp.route("/reportes/tickets-soporte")
def reportes_tickets():
    return jsonify({"status": "ok", "data": TICKETS})


@api_bp.route("/reportes/resumen-ejecutivo")
def reportes_resumen():
    return jsonify({"status": "ok", "data": {
        "ingresos_ytd":       35820000,
        "meta_anual":         48000000,
        "cumplimiento_meta":  74.6,
        "clientes_nuevos_ytd": 28,
        "churn_rate":         3.2,
        "crecimiento_yoy":    18.5,
        "ebitda_margen":      31.4,
        "empleados_totales":  len(EMPLEADOS),
    }})
