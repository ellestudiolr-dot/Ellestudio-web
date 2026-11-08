# Copias de respaldo que la página usa SOLO si no logra conectarse a la base de datos (señal débil, red que la bloquea).
# Lee con la llave pública (la misma que ya usa la página), así que no necesita contraseñas.
# Uso, desde la carpeta del repo:  python3 tools/respaldos.py
import json, re, pathlib, urllib.request, datetime
raiz = pathlib.Path(__file__).resolve().parent.parent
cfg = (raiz / 'js' / 'reserva.js').read_text(encoding='utf-8')
URL = re.search(r"SUPABASE_URL:\s*'([^']+)'", cfg).group(1)
KEY = re.search(r"SUPABASE_ANON:\s*'([^']+)'", cfg).group(1)
def leer(consulta):
    r = urllib.request.Request(URL + '/rest/v1/' + consulta, headers={'apikey': KEY, 'Authorization': 'Bearer ' + KEY})
    return json.loads(urllib.request.urlopen(r, timeout=30).read().decode('utf-8'))
datos = raiz / 'data'
contenido = {f['clave']: f['valor'] for f in leer('web_contenido?select=clave,valor') if f.get('valor') not in (None, '')}
(datos / 'contenido-respaldo.json').write_text(json.dumps(contenido, ensure_ascii=False, indent=0), encoding='utf-8')
catalogo = leer('web_catalogo?select=*&activo=eq.true&order=orden.asc')
(datos / 'catalogo-respaldo.json').write_text(json.dumps(catalogo, ensure_ascii=False, indent=0), encoding='utf-8')
servicios = leer('precios_servicios?select=categoria,grupo,nombre,genero,incluye,realiza,precio_sesion,paquetes,extra,consultar,orden&activo=eq.true&order=orden.asc')
promos = leer('precios_promociones?select=nombre,precio,nota,inicio,fin,orden&order=orden.asc')
(datos / 'precios.json').write_text(json.dumps({'actualizado': datetime.date.today().isoformat(), 'servicios': servicios, 'promociones': promos}, ensure_ascii=False, indent=0), encoding='utf-8')
print('respaldos:', len(contenido), 'textos ·', len(catalogo), 'bloques del catálogo ·', len(servicios), 'servicios y', len(promos), 'promociones')
