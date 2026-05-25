# app.py — Punto de entrada de la aplicación Flask
# Aquí se crea la app, se configura y se definen las rutas principales (páginas)

from flask import Flask, render_template
from datetime import datetime
from api.routes import api_bp  # Importamos el grupo de rutas de la API

# Creamos la aplicación Flask
app = Flask(__name__)

# Clave secreta para seguridad de sesiones (protege cookies y formularios)
app.secret_key = "tress_dashboard_2024_secret"

# Modo debug: muestra errores detallados en el navegador mientras desarrollamos
app.debug = True

# Registramos el Blueprint de la API bajo el prefijo /api
# Así todas las rutas de la API quedan como /api/algo
app.register_blueprint(api_bp, url_prefix="/api")


# context_processor: inyecta variables globales disponibles en TODOS los templates HTML
# No hay que pasarlas manualmente en cada render_template
@app.context_processor
def inject_globals():
    return {
        "current_year": datetime.now().year,  # El año actual, para el footer
        "app_name":     "Tress Dashboard",    # Nombre que aparece en el <title> de cada página
        "version":      "2.4.1",              # Versión del sistema
    }


# ── Rutas de las páginas (una función por cada página) ──────────────────────

@app.route("/")
def index():
    # Página de inicio — le dice al template cuál item del menú marcar como "activo"
    return render_template("index.html", active="inicio")


@app.route("/nomina")
def nomina():
    # Página de Nómina & RRHH
    return render_template("nomina.html", active="nomina")


@app.route("/operaciones")
def operaciones():
    # Página de Operaciones & ERP
    return render_template("operaciones.html", active="operaciones")


@app.route("/reportes")
def reportes():
    # Página de Reportes Ejecutivos
    return render_template("reportes.html", active="reportes")


# ── Manejadores de errores ───────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    # Cuando alguien visita una URL que no existe, mostramos nuestra página 404
    return render_template("404.html"), 404


@app.errorhandler(500)
def server_error(e):
    # Cuando ocurre un error interno del servidor, mostramos nuestra página 500
    return render_template("500.html"), 500


# Ejecutamos la app directamente solo si corremos este archivo (no al importarlo)
if __name__ == "__main__":
    app.run(debug=True, port=5000)
