import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app import app
import datetime

c = app.test_client()
checks = []
def ok(lbl):   checks.append(('OK',   lbl))
def fail(lbl): checks.append(('FAIL', lbl))

html   = c.get('/').data.decode('utf-8','replace')
html_n = c.get('/nomina').data.decode('utf-8','replace')
html_o = c.get('/operaciones').data.decode('utf-8','replace')
html_r = c.get('/reportes').data.decode('utf-8','replace')

# ── app.py config ──────────────────────────────────────────────────────────
(ok if app.secret_key == 'tress_dashboard_2024_secret' else fail)('app.secret_key correcto')
(ok if app.debug == True else fail)('debug=True')
rules = [str(r) for r in app.url_map.iter_rules()]
(ok if any('/api/health' in r for r in rules) else fail)('Blueprint api registrado en /api')

# ── context_processor ─────────────────────────────────────────────────────
(ok if 'TRESS' in html or 'Tress' in html else fail)('context_processor: app_name en HTML')
(ok if '2.4.1' in html else fail)('context_processor: version 2.4.1')
(ok if str(datetime.datetime.now().year) in html else fail)('context_processor: current_year')

# ── error handlers ────────────────────────────────────────────────────────
r404 = c.get('/no-existe')
(ok if r404.status_code == 404 else fail)('Error handler 404')
html404 = r404.data.decode('utf-8','replace')
(ok if '404' in html404 else fail)('404.html renderizado')

# ── base.html: fuentes, assets, nav ───────────────────────────────────────
(ok if 'fonts.googleapis.com' in html else fail)('Google Fonts importado')
(ok if 'Syne' in html else fail)('Font Syne en link')
(ok if 'DM+Sans' in html or 'DM%2BSans' in html else fail)('Font DM Sans en link')
(ok if 'main.css' in html else fail)('main.css importado')
(ok if 'main.js' in html else fail)('main.js importado')
(ok if 'id="currentDate"' in html else fail)('topbar: id=currentDate')
(ok if 'id="apiStatus"' in html else fail)('topbar: id=apiStatus')
(ok if 'id="sidebarToggle"' in html else fail)('topbar: id=sidebarToggle (hamburger)')
(ok if 'class="sidebar"' in html else fail)('sidebar presente')
(ok if 'sidebar-footer' in html else fail)('sidebar footer presente')
(ok if 'Admin Tress' in html else fail)('sidebar footer: Admin Tress')
(ok if 'active' in html else fail)('nav: clase active en inicio')
(ok if 'active' in html_n else fail)('nav: clase active en nomina')
(ok if 'url_for' not in html else fail)('url_for resuelto (no aparece raw en HTML)')

# ── index.html ────────────────────────────────────────────────────────────
(ok if 'Sistema ERP Empresarial' in html else fail)('index: hero badge')
(ok if 'Grupo Tress' in html else fail)('index: hero titulo')
(ok if 'btn-primary' in html else fail)('index: btn-primary')
(ok if 'btn-outline' in html else fail)('index: btn-outline')
for id_ in ['heroEmpleados','heroIngresos','heroClientes','heroUptime',
            'masaSalarial','crecimiento','npsScore','ticketsAbiertos','productsGrid']:
    (ok if 'id="'+id_+'"' in html else fail)('index.html id='+id_)
(ok if 'index.js' in html else fail)('index.html: index.js cargado')
(ok if 'quick-grid' in html else fail)('index.html: quick-grid (accesos rapidos)')

# ── nomina.html ───────────────────────────────────────────────────────────
for id_ in ['kTotalEmp','kMasa','kNuevos','kRotacion',
            'filterDepto','filterActivo','btnFiltrar','tbodyEmpleados',
            'chartDepto','chartMasaSalarial']:
    (ok if 'id="'+id_+'"' in html_n else fail)('nomina.html id='+id_)
(ok if 'Nombre' in html_n and 'Puesto' in html_n else fail)('nomina.html: thead columnas')
(ok if 'nomina.js' in html_n else fail)('nomina.html: nomina.js cargado')
(ok if 'chart.umd.min.js' in html_n else fail)('nomina.html: Chart.js CDN')

# ── operaciones.html ──────────────────────────────────────────────────────
for id_ in ['kLicencias','kIngresos','kRenovacion','kClientes',
            'erpProductsGrid','chartIngresos',
            'indUptime','uptimeBar','indNPS','npsBar','indTickets','ticketsBar']:
    (ok if 'id="'+id_+'"' in html_o else fail)('operaciones.html id='+id_)
(ok if 'operaciones.js' in html_o else fail)('operaciones.html: operaciones.js cargado')
(ok if 'chart.umd.min.js' in html_o else fail)('operaciones.html: Chart.js CDN')

# ── reportes.html ─────────────────────────────────────────────────────────
for id_ in ['execGrid','metaFill','metaPct','metaActual','metaAnual',
            'chartSatisfaccion','chartTickets','tbodyTickets']:
    (ok if 'id="'+id_+'"' in html_r else fail)('reportes.html id='+id_)
(ok if 'reportes.js' in html_r else fail)('reportes.html: reportes.js cargado')
(ok if 'chart.umd.min.js' in html_r else fail)('reportes.html: Chart.js CDN')

# ── CSS variables requeridas ───────────────────────────────────────────────
with open('static/css/main.css', encoding='utf-8') as f:
    css = f.read()
for var in ['--bg-base','--bg-card','--bg-card-2','--bg-hover','--border',
            '--border-light','--text-primary','--text-secondary','--text-muted',
            '--accent','--accent-glow','--accent-2','--green','--orange',
            '--purple','--red','--sidebar-w','--topbar-h','--font-display','--font-body']:
    (ok if var in css else fail)('CSS variable: '+var)

# ── CSS componentes clave ──────────────────────────────────────────────────
for comp in ['.sidebar','.sidebar-logo','.logo-mark','.nav-item','.topbar',
             '.api-status','.status-dot','.kpi-strip','.kpi-card','.kpi-icon',
             '.section-block','.hero-section','.hero-card','.floating',
             '.btn-primary','.btn-outline','.data-table','.badge',
             '.products-grid','.product-card','.products-erp-grid','.erp-card',
             '.mini-bar','.mini-fill','.indicators-grid','.indicator-card',
             '.progress-bar','.progress-fill','.exec-grid','.exec-card',
             '.meta-bar-bg','.meta-bar-fill','.quick-grid','.quick-card',
             '.charts-grid','.chart-container']:
    (ok if comp in css else fail)('CSS componente: '+comp)

# ── CSS responsive ────────────────────────────────────────────────────────
for bp in ['1100px','768px','480px']:
    (ok if bp in css else fail)('CSS breakpoint: @media '+bp)
(ok if 'translateX' in css else fail)('CSS: sidebar mobile translateX')
(ok if '.sidebar.open' in css else fail)('CSS: .sidebar.open')

# ── JS: main.js ───────────────────────────────────────────────────────────
with open('static/js/main.js', encoding='utf-8') as f:
    js_main = f.read()
(ok if 'currentDate' in js_main else fail)('main.js: currentDate')
(ok if 'es-MX' in js_main else fail)('main.js: fecha en es-MX')
(ok if 'sidebarToggle' in js_main else fail)('main.js: sidebar toggle')
(ok if '/api/health' in js_main else fail)('main.js: fetch /api/health')
(ok if 'window.Tress' in js_main else fail)('main.js: window.Tress expuesto')
(ok if 'formatMXN' in js_main else fail)('main.js: formatMXN')
(ok if 'formatNum' in js_main else fail)('main.js: formatNum')
(ok if 'formatPct' in js_main else fail)('main.js: formatPct')
(ok if 'currency' in js_main and 'MXN' in js_main else fail)('main.js: Intl.NumberFormat MXN')

# ── JS: index.js ──────────────────────────────────────────────────────────
with open('static/js/index.js', encoding='utf-8') as f:
    js_idx = f.read()
(ok if 'Promise.all' in js_idx else fail)('index.js: Promise.all')
(ok if '/api/reportes/resumen-ejecutivo' in js_idx else fail)('index.js: fetch resumen-ejecutivo')
(ok if '/api/operaciones/kpis' in js_idx else fail)('index.js: fetch kpis')
(ok if 'heroEmpleados' in js_idx else fail)('index.js: pobla heroEmpleados')
(ok if 'heroIngresos' in js_idx else fail)('index.js: pobla heroIngresos')
(ok if 'heroClientes' in js_idx else fail)('index.js: pobla heroClientes')
(ok if 'heroUptime' in js_idx else fail)('index.js: pobla heroUptime')
(ok if 'masaSalarial' in js_idx else fail)('index.js: pobla masaSalarial')
(ok if 'productsGrid' in js_idx else fail)('index.js: pobla productsGrid')
(ok if 'try' in js_idx and 'catch' in js_idx else fail)('index.js: try/catch en fetch')

# ── JS: nomina.js ─────────────────────────────────────────────────────────
with open('static/js/nomina.js', encoding='utf-8') as f:
    js_nom = f.read()
(ok if '/api/nomina/resumen' in js_nom else fail)('nomina.js: fetch resumen')
(ok if '/api/nomina/empleados' in js_nom else fail)('nomina.js: fetch empleados')
(ok if 'depto' in js_nom and 'activo' in js_nom else fail)('nomina.js: query params depto/activo')
(ok if 'btnFiltrar' in js_nom else fail)('nomina.js: evento btnFiltrar')
(ok if 'tbodyEmpleados' in js_nom else fail)('nomina.js: pobla tbodyEmpleados')
(ok if 'badge-green' in js_nom and 'badge-red' in js_nom else fail)('nomina.js: badges Activo/Inactivo')
(ok if 'doughnut' in js_nom else fail)('nomina.js: Chart doughnut')
(ok if '65%' in js_nom else fail)('nomina.js: cutout 65%')
(ok if 'tension' in js_nom else fail)('nomina.js: line chart tension')
(ok if 'rgba(61,127,255,0.1)' in js_nom else fail)('nomina.js: fill color azul')
(ok if 'try' in js_nom and 'catch' in js_nom else fail)('nomina.js: try/catch')

# ── JS: operaciones.js ────────────────────────────────────────────────────
with open('static/js/operaciones.js', encoding='utf-8') as f:
    js_op = f.read()
(ok if '/api/operaciones/kpis' in js_op else fail)('operaciones.js: fetch kpis')
(ok if '/api/operaciones/productos' in js_op else fail)('operaciones.js: fetch productos')
(ok if '/api/operaciones/ingresos-mensuales' in js_op else fail)('operaciones.js: fetch ingresos')
(ok if 'setTimeout' in js_op else fail)('operaciones.js: setTimeout para progress bars')
(ok if 'requestAnimationFrame' in js_op else fail)('operaciones.js: requestAnimationFrame mini-fills')
(ok if 'stacked' in js_op and 'true' in js_op else fail)('operaciones.js: stacked bar chart')
(ok if 'try' in js_op and 'catch' in js_op else fail)('operaciones.js: try/catch')

# ── JS: reportes.js ───────────────────────────────────────────────────────
with open('static/js/reportes.js', encoding='utf-8') as f:
    js_rep = f.read()
(ok if '/api/reportes/resumen-ejecutivo' in js_rep else fail)('reportes.js: fetch resumen-ejecutivo')
(ok if '/api/reportes/satisfaccion-clientes' in js_rep else fail)('reportes.js: fetch satisfaccion')
(ok if '/api/reportes/tickets-soporte' in js_rep else fail)('reportes.js: fetch tickets')
(ok if 'setTimeout' in js_rep else fail)('reportes.js: setTimeout para metaFill')
(ok if 'metaFill' in js_rep else fail)('reportes.js: anima metaFill')
(ok if '"pie"' in js_rep else fail)('reportes.js: Chart pie')
(ok if 'cerrados' in js_rep and 'abiertos' in js_rep else fail)('reportes.js: 2 datasets bar (cerrados/abiertos)')
(ok if 'tbodyTickets' in js_rep else fail)('reportes.js: pobla tbodyTickets')
(ok if 'eff-bar' in js_rep else fail)('reportes.js: mini progress bar eficiencia')
(ok if 'try' in js_rep and 'catch' in js_rep else fail)('reportes.js: try/catch')

# ── Chart.js config (color ticks y grid) ─────────────────────────────────
for js_name, js_src in [('nomina.js',js_nom),('operaciones.js',js_op),('reportes.js',js_rep)]:
    (ok if '#8899bb' in js_src else fail)(js_name+': tickColor #8899bb')
    (ok if '#1f2d4a' in js_src else fail)(js_name+': gridColor #1f2d4a')
    (ok if 'DM Sans' in js_src or 'DM+Sans' in js_src else fail)(js_name+': font DM Sans')
    (ok if 'responsive' in js_src else fail)(js_name+': responsive:true')
    (ok if 'maintainAspectRatio' in js_src else fail)(js_name+': maintainAspectRatio:false')

# ── requirements.txt ──────────────────────────────────────────────────────
with open('requirements.txt') as f:
    req = f.read()
(ok if 'Flask==3.1.0' in req else fail)('requirements.txt: Flask==3.1.0')
(ok if 'Werkzeug==3.1.3' in req else fail)('requirements.txt: Werkzeug==3.1.3')

# ── Resumen ───────────────────────────────────────────────────────────────
total_ok   = sum(1 for s,_ in checks if s=='OK')
total_fail = sum(1 for s,_ in checks if s=='FAIL')
for status, label in checks:
    print(status + '  ' + label)

print('\n' + '='*60)
print(f'TOTAL: {len(checks)} checks | OK: {total_ok} | FAIL: {total_fail}')
if total_fail == 0:
    print('RESULTADO: TODO CUMPLIDO AL 100%')
else:
    print('RESULTADO: HAY ITEMS PENDIENTES')
