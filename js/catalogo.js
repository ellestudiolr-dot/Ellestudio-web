// elle studio · Catálogo: dos guías de Lyrosse, «Edición Corporal» (Moldea tu cuerpo) y «Glúteos de Porcelana».
// Cada bloque es una fila de web_catalogo (Supabase, columna guia) y se edita desde el CRM. Se pinta en la pestaña Catálogo.
(function(){
  var TEMAS = ['crema', 'crema', 'rosa', 'oscuro', 'oscuro', 'crema'];
  var GUIAS = [ { id: 'corporal', nombre: 'Edición Corporal', pref: 'cat2_', portada: 'img/catalogo/l-portada.jpg', crema: true },
                { id: 'gluteos',  nombre: 'Glúteos de Porcelana', pref: 'cat_', portada: 'img/precios/gluteos.jpg?v=20261107' } ];
  var activa = 'corporal';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function money(n){ n = Number(n); if(isNaN(n)) return ''; var t = Number.isInteger(n) ? String(n) : n.toFixed(2); var p = t.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return 'S/ ' + p.join('.'); }
  function txt(clave, porDefecto){ var m = window._WEB_CONTENIDO || {}; return (m[clave] && String(m[clave]).trim()) ? m[clave] : (porDefecto || ''); }
  function lista(v){ return Array.isArray(v) ? v : []; }
  function guiaDe(it){ return (it && it.guia) ? it.guia : 'gluteos'; }

  function chips(l, cls){ l = lista(l).filter(Boolean); if(!l.length) return ''; return '<div class="ct-chips' + (cls ? ' ' + cls : '') + '">' + l.map(function(z){ return '<span>' + esc(z) + '</span>'; }).join('') + '</div>'; }
  function badge(it){
    if(it.inyectables === true) return '<span class="ct-badge ct-badge-iny">Lleva inyectables</span>';
    if(it.inyectables === false) return '<span class="ct-badge">No lleva inyectables</span>';
    return '';
  }
  function circulo(etq, precio, chico, antes, nota){
    return '<div class="ct-circ-wrap"><div class="ct-circ' + (chico ? ' ct-circ-sm' : '') + '"><small>' + esc(etq) + '</small><b>' + esc(money(precio)) + '</b></div>'
      + ((antes || nota) ? '<small class="ct-circ-nota">' + (antes ? 'Antes ' + esc(money(antes)) + (nota ? ' · ' : '') : '') + esc(nota || '') + '</small>' : '') + '</div>';
  }

  // «Moldea tu cuerpo» → «Moldea» + «tu cuerpo» en cursiva dorada (como su portada); con una o dos palabras queda igual
  function tituloAcento(t){
    var w = String(t || '').trim().split(/\s+/);
    if(w.length < 3) return esc(t);
    return esc(w.slice(0, w.length - 2).join(' ')) + ' <em>' + esc(w.slice(-2).join(' ')) + '</em>';
  }
  function portada(g){
    var p = g.pref, puntos = txt(p + 'puntos', '').split('·').map(function(s){ return s.trim(); }).filter(Boolean);
    var titulo = txt(p + 'titulo', g.nombre);
    return '<section class="ct-portada' + (g.crema ? ' ct-portada-crema' : '') + '">'
      + '<div class="ct-portada-txt"><span class="ct-ceja ct-ceja-oro" data-edit="' + p + 'ceja">' + esc(txt(p + 'ceja', 'La guía Elle')) + '</span>'
      + '<h2 class="ct-tit-grande" data-edit="' + p + 'titulo">' + (g.crema ? tituloAcento(titulo) : esc(titulo)) + '</h2>'
      + '<p class="ct-frase" data-edit="' + p + 'frase">' + esc(txt(p + 'frase', '')) + '</p>'
      + (puntos.length ? '<ul class="ct-puntos">' + puntos.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '')
      + '</div><div class="ct-portada-foto"><img src="' + esc(txt(p + 'portada_foto', g.portada)) + '" alt="" loading="lazy" data-edit-img="' + p + 'portada_foto"/></div></section>';
  }

  function intro(it, g){
    var cab = '<span class="ct-ceja">' + esc(it.ceja || txt(g.pref + 'intro_ceja', 'Empieza aquí')) + '</span>'
      + '<h3 class="ct-tit">' + esc(it.titulo) + '</h3>'
      + (it.texto ? '<p class="ct-texto">' + esc(it.texto) + '</p>' : '');
    var indice = '<ol class="ct-indice">' + lista(it.pasos).map(function(p){ return '<li><small>' + esc(p.t) + '</small><b>' + esc(p.n) + '</b></li>'; }).join('') + '</ol>';
    if(it.foto) return '<section class="ct-bloque ct-intro con-foto" data-cat-id="' + esc(it.id) + '">'
      + '<div class="ct-intro-foto"><img src="' + esc(it.foto) + '" alt="" loading="lazy"/></div><div>' + cab + indice + '</div></section>';
    return '<section class="ct-bloque ct-intro" data-cat-id="' + esc(it.id) + '"><div>' + cab + '</div>' + indice + '</section>';
  }
  // Fila de fotos del tratamiento (como en su catálogo): misma altura, sin recortar; «Antes/Después» como etiqueta
  function galeria(it){
    var g = lista(it.galeria).map(function(x){ return typeof x === 'string' ? { src: x } : x; }).filter(function(x){ return x && x.src; });
    if(!g.length) return '';
    return '<div class="ct-galeria">' + g.map(function(f){
        var w = Number(f.w) || 4, h = Number(f.h) || 3;
        return '<figure style="flex:' + (w / h).toFixed(3) + ' 1 0;aspect-ratio:' + w + '/' + h + '"><img src="' + esc(f.src) + '" alt="" loading="lazy"/>' + (f.etq ? '<figcaption>' + esc(f.etq) + '</figcaption>' : '') + '</figure>';
      }).join('') + '</div>' + (it.foto_nota ? '<p class="ct-foto-nota">' + esc(it.foto_nota) + '</p>' : '');
  }

  function tratamiento(it, k){
    var tema = TEMAS[k % TEMAS.length];
    var pasos = lista(it.pasos), paqs = lista(it.paquetes), incluye = lista(it.incluye);
    var circs = '';
    if(it.precio_sesion != null && it.precio_sesion !== '') circs += circulo('Sesión', it.precio_sesion, false);
    paqs.forEach(function(p){ if(p && p.precio != null) circs += circulo(p.etiqueta || ('Paquete de ' + p.sesiones), p.precio, true, p.antes, p.nota); });
    var datos = [it.duracion, it.frecuencia].filter(Boolean).map(esc).join(' · ');
    return '<section class="ct-bloque ct-trat ct-' + tema + '" data-cat-id="' + esc(it.id) + '">'
      + '<div class="ct-trat-txt">'
      + '<span class="ct-ceja">' + (it.numero ? esc(it.numero) + ' · ' : '') + esc(it.ceja || '') + '</span>'
      + '<h3 class="ct-tit">' + esc(it.titulo) + '</h3>'
      + (it.frase ? '<p class="ct-frase">' + esc(it.frase) + '</p>' : '')
      + badge(it)
      + galeria(it)
      + (it.texto ? '<p class="ct-texto">' + esc(it.texto) + '</p>' : '')
      + (lista(it.zonas).length ? '<span class="ct-sub">Zonas</span>' + chips(it.zonas) : '')
      + (lista(it.beneficios).length ? chips(it.beneficios, 'ct-benef') : '')
      + (incluye.length ? '<span class="ct-sub">Todo lo que incluye</span><div class="ct-incluye">' + incluye.map(function(c){ return '<div><b>' + esc(c.t) + '</b>' + (c.n ? '<small>' + esc(c.n) + '</small>' : '') + '</div>'; }).join('') + '</div>' : '')
      + (pasos.length ? '<ol class="ct-pasos">' + pasos.map(function(p, i){ return '<li><span class="ct-num">' + (i + 1) + '</span><div><b>' + esc(p.t) + '</b>' + (p.n ? '<small>' + esc(p.n) + '</small>' : '') + '</div></li>'; }).join('') + '</ol>' : '')
      + (it.regalo ? '<div class="ct-regalo"><small>De regalo</small>' + esc(it.regalo) + '</div>' : '')
      + '</div>'
      + '<div class="ct-trat-lado">'
      + (it.foto ? '<div class="ct-foto"><img src="' + esc(it.foto) + '" alt="" loading="lazy"/></div>' : '')
      + (circs ? '<div class="ct-circs">' + circs + '</div>' : '')
      + (datos ? '<div class="ct-datos">' + datos + '</div>' : '')
      + (it.nota ? '<div class="ct-nota">' + esc(it.nota) + '</div>' : '')
      + '<button type="button" class="ap-btn ' + (tema === 'oscuro' ? 'ap-btn-blanco' : 'ap-btn-oscuro') + '" data-pedir="' + esc(it.titulo) + '">Lo quiero</button>'
      + '</div></section>';
  }

  function consejos(it){
    var si = lista(it.pasos).filter(function(p){ return p.n !== 'no'; }), no = lista(it.pasos).filter(function(p){ return p.n === 'no'; });
    return '<section class="ct-bloque ct-consejos" data-cat-id="' + esc(it.id) + '">'
      + '<div><span class="ct-ceja">' + esc(it.ceja || '') + '</span><h3 class="ct-tit">' + esc(it.titulo) + '</h3>'
      + (it.frase ? '<p class="ct-frase">' + esc(it.frase) + '</p>' : '') + (it.texto ? '<p class="ct-texto">' + esc(it.texto) + '</p>' : '') + '</div>'
      + '<div class="ct-sino">'
      + '<div class="ct-si"><small>Sí</small><ul>' + si.map(function(p){ return '<li>' + esc(p.t) + '</li>'; }).join('') + '</ul></div>'
      + '<div class="ct-no"><small>No</small><ul>' + no.map(function(p){ return '<li>' + esc(p.t) + '</li>'; }).join('') + '</ul></div>'
      + '</div>'
      + (it.nota ? '<div class="ct-regalo ct-plus">' + esc(it.nota) + '</div>' : '')
      + '</section>';
  }

  // Resumen de precios de la guía (como la última página del catálogo impreso)
  function resumen(g, items){
    var filas = items.filter(function(it){ return it.tipo !== 'intro' && it.tipo !== 'consejos'; }).map(function(it){
      var p = lista(it.paquetes)[0], precio = p ? p.precio : it.precio_sesion;
      if(precio == null || precio === '') return '';
      var etq = p ? (p.etiqueta || (p.sesiones + ' sesiones')) : 'sesión';
      return '<li><span>' + esc(it.titulo) + ' <small>· ' + esc(etq) + '</small></span><b>' + (p && p.antes ? '<s>' + esc(money(p.antes)) + '</s>' : '') + esc(money(precio)) + '</b></li>';
    }).filter(Boolean);
    if(!filas.length) return '';
    return '<section class="ct-bloque ct-oscuro ct-resumen"><span class="ct-ceja">Tu lista de precios</span><h3 class="ct-tit">' + esc(g.nombre) + '</h3><ul>' + filas.join('') + '</ul></section>';
  }

  function cierre(g){
    return '<section class="ct-bloque ct-cierre"><div class="ct-sello">S/ 15</div><div><b>Separa tu cita</b><p data-edit="' + g.pref + 'reserva">' + esc(txt(g.pref + 'reserva', 'Reserva con S/ 15 y se descuenta de tu tratamiento. Escríbenos por WhatsApp.')) + '</p></div>'
      + '<button type="button" class="ap-btn ap-btn-blanco" onclick="abrirReserva()">Reservar cita</button></section>';
  }

  var cache = [];   // lo último pintado (para la vista previa del editor)

  function pintar(items){
    var caja = document.getElementById('catalogoApp');
    if(!caja) return;
    cache = items.slice();
    var bloques = {}, html = '';
    GUIAS.forEach(function(g){
      var act = items.filter(function(i){ return i && i.activo !== false && guiaDe(i) === g.id; }).sort(function(a, b){ return (a.orden || 0) - (b.orden || 0); });
      if(!act.length) return;
      var h = portada(g), k = 0;
      act.forEach(function(it){
        if(it.tipo === 'intro') h += intro(it, g);
        else if(it.tipo === 'consejos') h += consejos(it);
        else { h += tratamiento(it, k); k++; }
      });
      h += resumen(g, act) + cierre(g);
      bloques[g.id] = h;
    });
    var ids = Object.keys(bloques);
    if(!ids.length){ caja.innerHTML = ''; return; }
    if(ids.indexOf(activa) < 0) activa = ids[0];
    if(ids.length > 1) html += '<div class="ct-guias">' + GUIAS.filter(function(g){ return bloques[g.id]; }).map(function(g){ return '<button type="button" class="' + (g.id === activa ? 'on' : '') + '" data-guia="' + g.id + '">' + esc(g.nombre) + '</button>'; }).join('') + '</div>';
    ids.forEach(function(id){ html += '<div class="ct' + (id === activa ? '' : ' ct-oculta') + '" data-guia="' + id + '">' + bloques[id] + '</div>'; });
    caja.innerHTML = html;
    caja.querySelectorAll('.ct-guias button').forEach(function(b){
      b.addEventListener('click', function(){
        activa = b.getAttribute('data-guia');
        caja.querySelectorAll('.ct-guias button').forEach(function(x){ x.classList.toggle('on', x === b); });
        caja.querySelectorAll('.ct[data-guia]').forEach(function(c){ c.classList.toggle('ct-oculta', c.getAttribute('data-guia') !== activa); });
        var top = caja.getBoundingClientRect().top + window.scrollY - 90; if(window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
    // entran con el mismo efecto que el resto de la página
    if(window.IntersectionObserver){
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('on', e.isIntersecting); }); }, { threshold: 0.08 });
      caja.querySelectorAll('.ct-bloque, .ct-portada').forEach(function(el){ el.classList.add('rv'); io.observe(el); });
    }
  }

  function cargar(){
    var c = (typeof CONFIG !== 'undefined') ? CONFIG : null;
    if(!c || !c.SUPABASE_URL || !c.SUPABASE_ANON) return;
    fetch(c.SUPABASE_URL + '/rest/v1/web_catalogo?select=*&activo=eq.true&order=orden.asc', {
      headers: { 'apikey': c.SUPABASE_ANON, 'Authorization': 'Bearer ' + c.SUPABASE_ANON }, cache: 'no-store'
    })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(filas){ if(Array.isArray(filas)) pintar(filas); })
      .catch(function(){});
  }

  window.cargarCatalogo = cargar;
  window.verGuiaCatalogo = function(id){ activa = id; pintar(cache); };
  // Vista previa de un bloque editado en el CRM (sin guardar): se vuelve a pintar con ese bloque cambiado, en su guía
  window.apCatalogoPreview = function(item){
    if(!item || item.id == null) return;
    var i = cache.findIndex(function(x){ return String(x.id) === String(item.id); });
    if(i >= 0) cache[i] = Object.assign({}, cache[i], item); else cache.push(item);
    activa = guiaDe(item);
    pintar(cache);
  };

  // Se actualiza solo: textos de portada (cat_ / cat2_) y bloques guardados en el CRM, sin recargar la página
  document.addEventListener('web-contenido-cambio', function(e){
    var cl = (e.detail && e.detail.claves) || [];
    if(cl.some(function(k){ return /^cat2?_/.test(k); }) && cache.length) pintar(cache);
  });
  var firma = '';
  function revisarCatalogo(){
    var c = (typeof CONFIG !== 'undefined') ? CONFIG : null;
    if(!c || !c.SUPABASE_URL || !c.SUPABASE_ANON || window._MODO_EDITOR || document.hidden) return;
    fetch(c.SUPABASE_URL + '/rest/v1/web_catalogo?select=id,orden,activo,actualizado&order=id.asc', {
      headers: { 'apikey': c.SUPABASE_ANON, 'Authorization': 'Bearer ' + c.SUPABASE_ANON }, cache: 'no-store'
    }).then(function(r){ return r.ok ? r.json() : null; }).then(function(f){
      if(!Array.isArray(f)) return;
      var nueva = JSON.stringify(f);
      if(firma && nueva !== firma) cargar();
      firma = nueva;
    }).catch(function(){});
  }
  setInterval(revisarCatalogo, 15000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) revisarCatalogo(); });
  setTimeout(revisarCatalogo, 4000);

  // Espera a los textos de la portada (web_contenido) si ya están cargando; si no, pinta igual
  var pintado = false;
  function arrancar(){ if(pintado) return; pintado = true; cargar(); }
  document.addEventListener('web-contenido-listo', arrancar);
  setTimeout(arrancar, 1500);
})();
