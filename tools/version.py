# Marca una versión nueva de la página antes de publicar (los teléfonos que tengan la vieja se recargan solos).
# Uso, desde la carpeta del repo:  python3 tools/version.py
import datetime, json, re, pathlib
raiz = pathlib.Path(__file__).resolve().parent.parent
v = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
(raiz / 'version.json').write_text(json.dumps({'v': v}) + '\n', encoding='utf-8')
idx = raiz / 'index.html'
t = idx.read_text(encoding='utf-8')
t2, n = re.subn(r"window\.WEB_VERSION = '[^']*';", "window.WEB_VERSION = '" + v + "';", t)
assert n == 1, 'no encontré window.WEB_VERSION en index.html'
idx.write_text(t2, encoding='utf-8')
print('versión', v)
