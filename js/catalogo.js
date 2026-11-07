// elle studio · Catálogo «Glúteos de Porcelana» (la guía que armó Lyrosse)
// Cada tratamiento es una fila de la tabla web_catalogo (Supabase) y se edita desde el CRM.
// Se pinta arriba de la lista completa de precios, en la pestaña Catálogo.
(function(){
  var TEMAS = ['crema', 'crema', 'rosa', 'oscuro', 'oscuro', 'crema'];   // se alternan por tratamiento

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function money(n){ n = Number(n); if(isNaN(n)) return ''; return 'S/ ' + (Number.isInteger(n) ? String(n) : n.toFixed(2)); }
  function txt(clave, porDefecto){ var m = window._WEB_CONTENIDO || {}; return (m[clave] && String(m[clave]).trim()) ? m[clave] : (porDefecto || ''); }
  function lista(v){ return Array.isArray(v) ? v : []; }

  function circulo(etq, precio, chico){
    return '<div class="ct-circ' + (chico ? ' ct-circ-sm' : '') + '"><small>' + esc(etq) + '</small><b>' + esc(money(precio)) + '</b></div>';
  }

  function portada(){
    var puntos = txt('cat_puntos', '').split('·').map(function(s){ return s.trim(); }).filter(Boolean);
    return '<section class="ct-portada">'
      + '<div class="ct-portada-txt"><span class="ct-ceja ct-ceja-oro">' + esc(txt('cat_ceja', 'La guía Elle')) + '</span>'
      + '<h2 class="ct-tit-grande">' + esc(txt('cat_titulo', 'Glúteos de Porcelana')) + '</h2>'
      + '<p class="ct-frase">' + esc(txt('cat_frase', '')) + '</p>'
      + (puntos.length ? '<ul class="ct-puntos">' + puntos.map(function(p){ return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '')
      + '</div><div class="ct-portada-foto"><img src="' + esc(txt('cat_portada_foto', 'img/precios/gluteos.jpg')) + '" alt="" loading="lazy" data-edit-img="cat_portada_foto"/></div></section>';
  }

  function intro(it){
    return '<section class="ct-bloque ct-intro" data-cat-id="' + esc(it.id) + '">'
      + '<div><span class="ct-ceja">' + esc(it.ceja || txt('cat_intro_ceja', 'Empieza aquí')) + '</span>'
      + '<h3 class="ct-tit">' + esc(it.titulo) + '</h3>'
      + (it.texto ? '<p class="ct-texto">' + esc(it.texto) + '</p>' : '') + '</div>'
      + '<ol class="ct-indice">' + lista(it.pasos).map(function(p){ return '<li><small>' + esc(p.t) + '</small><b>' + esc(p.n) + '</b></li>'; }).join('') + '</ol>'
      + '</section>';
  }

  function tratamiento(it, k){
    var tema = TEMAS[k % TEMAS.length];
    var pasos = lista(it.pasos), paqs = lista(it.paquetes);
    var circs = '';
    if(it.precio_sesion != null && it.precio_sesion !== '') circs += circulo('Sesión', it.precio_sesion, false);
    paqs.forEach(function(p){ if(p && p.sesiones && p.precio != null) circs += circulo('Paquete de ' + p.sesiones, p.precio, true); });
    var datos = [it.duracion, it.frecuencia].filter(Boolean).map(esc).join(' · ');
    return '<section class="ct-bloque ct-trat ct-' + tema + '" data-cat-id="' + esc(it.id) + '">'
      + '<div class="ct-trat-txt">'
      + '<span class="ct-ceja">' + (it.numero ? esc(it.numero) + ' · ' : '') + esc(it.ceja || '') + '</span>'
      + '<h3 class="ct-tit">' + esc(it.titulo) + '</h3>'
      + (it.frase ? '<p class="ct-frase">' + esc(it.frase) + '</p>' : '')
      + (it.texto ? '<p class="ct-texto">' + esc(it.texto) + '</p>' : '')
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

  function cierre(){
    return '<section class="ct-bloque ct-cierre"><div class="ct-sello">S/ 15</div><div><b>Separa tu cita</b><p>' + esc(txt('cat_reserva', 'Reserva con S/ 15 y se descuenta de tu tratamiento. Escríbenos por WhatsApp.')) + '</p></div>'
      + '<button type="button" class="ap-btn ap-btn-blanco" onclick="abrirReserva()">Reservar cita</button></section>';
  }

  var cache = [];   // lo último pintado (para la vista previa del editor)

  function pintar(items){
    var caja = document.getElementById('catalogoApp');
    if(!caja) return;
    cache = items.slice();
    var activos = items.filter(function(i){ return i && i.activo !== false; }).sort(function(a, b){ return (a.orden || 0) - (b.orden || 0); });
    if(!activos.length){ caja.innerHTML = ''; return; }
    var html = portada(), k = 0;
    activos.forEach(function(it){
      if(it.tipo === 'intro') html += intro(it);
      else if(it.tipo === 'consejos') html += consejos(it);
      else { html += tratamiento(it, k); k++; }
    });
    html += cierre();
    caja.innerHTML = '<div class="ct">' + html + '</div>';
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
  // Vista previa de un bloque editado en el CRM (sin guardar): se vuelve a pintar con ese bloque cambiado
  window.apCatalogoPreview = function(item){
    if(!item || item.id == null) return;
    var i = cache.findIndex(function(x){ return String(x.id) === String(item.id); });
    if(i >= 0) cache[i] = Object.assign({}, cache[i], item); else cache.push(item);
    pintar(cache);
  };

  // Espera a los textos de la portada (web_contenido) si ya están cargando; si no, pinta igual
  var pintado = false;
  function arrancar(){ if(pintado) return; pintado = true; cargar(); }
  document.addEventListener('web-contenido-listo', arrancar);
  setTimeout(arrancar, 1500);
})();
