from flask import Flask, render_template
from datetime import datetime
from api.routes import api_bp

app = Flask(__name__)
app.secret_key = "tress_dashboard_2024_secret"
app.debug = True

app.register_blueprint(api_bp, url_prefix="/api")


@app.context_processor
def inject_globals():
    return {
        "current_year": datetime.now().year,
        "app_name":     "Tress Dashboard",
        "version":      "2.4.1",
    }


@app.route("/")
def index():
    return render_template("index.html", active="inicio")


@app.route("/nomina")
def nomina():
    return render_template("nomina.html", active="nomina")


@app.route("/operaciones")
def operaciones():
    return render_template("operaciones.html", active="operaciones")


@app.route("/reportes")
def reportes():
    return render_template("reportes.html", active="reportes")


@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404


@app.errorhandler(500)
def server_error(e):
    return render_template("500.html"), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
