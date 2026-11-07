// elle studio · Precios en vivo (los mismos que la lista del CRM) con las fotos del proceso
// Lee precios_servicios y precios_promociones de Supabase con la llave pública (solo lectura).
// Si no se puede, usa la copia data/precios.json. Cada «Pedir» abre WhatsApp (js/whatsapp.js).
(function(){
  var ORDEN = ['Promociones', 'Depilación láser', 'Glúteos y body', 'Reductores', 'Hollywood Peel', 'Faciales', 'Productos'];
  var LASER = 'Depilación láser', PROMOS = 'Promociones', PRODUCTOS = 'Productos';
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  // ---- fotos del proceso (mismas reglas que la lista de precios del CRM) ----
  var FOTO_DIR = 'img/precios/';
  var FOTO_SERV = { 'hollywood peel|gluteos': 'gluteos-carbon-2', 'hollywood peel|entrepierna': 'gluteos-carbon', 'hollywood peel|axilas, codos o cuello': 'peel-codo' };
  var FOTO_REGLAS = [
    [/mini zona/, 'laser-bozo'], [/media pierna.*axilas|axilas.*media pierna/, 'laser-pierna-2'], [/media pierna/, 'laser-pierna'], [/bikini/, 'laser-axilas-2'],
    [/slim body/, 'rf'], [/body reafirm/, 'bambu'], [/sculpt therapy/, 'madero'], [/sculpt body/, 'lipolaser'], [/peptona/, 'peptonas'], [/enzima/, 'enzimas'],
    [/skin face porcelana/, 'porcelana-face'], [/skin face glow/, 'glow'], [/skin face balance/, 'balance'], [/skin face/, 'skin-face'], [/hidralips/, 'hidralips'],
    [/hollywood peel facial|carbon peel facial/, 'peel-face'], [/glow back|espalda/, 'espalda'], [/carbon/, 'gluteos-carbon'], [/body de porcelana/, 'body-porcelana'],
    [/gluteo/, 'gluteos'], [/axilas/, 'laser-axilas'], [/laser/, 'laser-axilas']
  ];
  var FOTOS = { laser: ['laser-axilas', 'laser-axilas-2'], peel: ['peel-face', 'peel-face-2'], facial: ['skin-face', 'skin-face-2'], gluteos: ['gluteos', 'body-porcelana'], reductores: ['rf', 'rf-2'] };
  var FOTO_GRUPO = { 'mini zonas': 'laser-bozo', 'zonas pequenas': 'laser-axilas', 'zonas medias': 'laser-pierna', 'zonas completas': 'laser-pierna-2' };
  var cnt = {};

  function norm(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function money(n){ n = Number(n); if(isNaN(n)) return ''; return 'S/ ' + (Number.isInteger(n) ? String(n) : n.toFixed(2)); }
  function uno(s){ if(s.consultar) return null; var n = Number(s.precio_sesion); return (s.precio_sesion == null || isNaN(n)) ? null : n; }
  function paqs(s){ return (Array.isArray(s.paquetes) ? s.paquetes : []).filter(function(p){ return p && p.sesiones; }).sort(function(a, b){ return a.sesiones - b.sesiones; }); }
  function fotoTipo(texto, categoria){
    var t = norm(texto), c = norm(categoria);
    if(t.indexOf('laser') >= 0 || c.indexOf('laser') >= 0) return 'laser';
    if(t.indexOf('peel') >= 0 || t.indexOf('carbon') >= 0 || c.indexOf('peel') >= 0) return 'peel';
    if(t.indexOf('skin face') >= 0 || t.indexOf('hidralips') >= 0 || c.indexOf('facial') >= 0) return 'facial';
    if(t.indexOf('gluteo') >= 0 || t.indexOf('porcelana') >= 0 || t.indexOf('glow back') >= 0 || c.indexOf('gluteo') >= 0) return 'gluteos';
    if(t.indexOf('slim') >= 0 || t.indexOf('sculpt') >= 0 || t.indexOf('reafirm') >= 0 || t.indexOf('enzima') >= 0 || t.indexOf('peptona') >= 0 || c.indexOf('reductor') >= 0) return 'reductores';
    return '';
  }
  function fotoSrc(texto, categoria){
    var t = norm(texto).replace(/\s+/g, ' ').trim(), c = norm(categoria).trim();
    var propia = FOTO_SERV[c + '|' + t];
    if(propia) return FOTO_DIR + propia + '.jpg';
    for(var i = 0; i < FOTO_REGLAS.length; i++){ if(FOTO_REGLAS[i][0].test(t)) return FOTO_DIR + FOTO_REGLAS[i][1] + '.jpg'; }
    var tipo = fotoTipo(texto, categoria); if(!tipo) return '';
    var lista = FOTOS[tipo], k = (cnt[tipo] = (cnt[tipo] || 0) + 1) - 1;
    return FOTO_DIR + lista[k % lista.length] + '.jpg';
  }
  function fotoHtml(src){ return src ? '<div class="ap-pfoto"><img src="' + esc(src) + '" alt="" loading="lazy"/></div>' : ''; }

  // ---- datos ----
  var SERV = [], PROMO = [], cat = null, gen = 'mujer';
  function hoy(){ var d = new Date(); var m = d.getMonth() + 1, dd = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd; }
  function promosActivas(){ var h = hoy(); return PROMO.filter(function(p){ return p && p.nombre && (!p.inicio || String(p.inicio).slice(0, 10) <= h) && (!p.fin || String(p.fin).slice(0, 10) >= h); }); }
  function categorias(){
    var vistas = {}, cats = [];
    SERV.forEach(function(s){ if(s.categoria && !vistas[s.categoria]){ vistas[s.categoria] = 1; cats.push(s.categoria); } });
    cats.sort(function(a, b){ return ((ORDEN.indexOf(a) + 1) || 99) - ((ORDEN.indexOf(b) + 1) || 99); });
    if(promosActivas().length) cats.unshift(PROMOS);
    return cats;
  }
  function ordenar(lista){ return lista.slice().sort(function(a, b){ return (a.orden || 0) - (b.orden || 0) || String(a.nombre).localeCompare(String(b.nombre)); }); }
  function btn(texto, pedir, mini){ return '<button type="button" class="ap-btn ap-btn-oscuro ' + (mini ? 'ap-pmini' : 'ap-pbtn') + '" data-pedir="' + esc(pedir) + '">' + esc(texto) + '</button>'; }

  // ---- vistas ----
  function tarjeta(s){
    var u = uno(s), ps = paqs(s);
    var consultar = s.consultar || (u == null && !ps.length);
    var precio = u != null ? '<div class="ap-pprecio">' + money(u) + '<small>1 sesión</small></div>'
      : (consultar ? '<div class="ap-pprecio ap-pprecio-sm">Consultar</div>' : '<div class="ap-pquien">Solo en paquete</div>');
    var paqHtml = ps.length ? '<div class="ap-ppaqs">' + ps.map(function(p){
      return '<span class="ap-ppaq">' + p.sesiones + ' sesiones · ' + (p.precio != null ? money(p.precio) : 'Consultar') + '</span>';
    }).join('') + '</div>' : '';
    return '<div class="ap-pcard">' + fotoHtml(fotoSrc(s.nombre, s.categoria))
      + '<div class="ap-pbody"><div class="ap-pnombre">' + esc(s.nombre) + '</div>'
      + (s.realiza ? '<div class="ap-pquien">Lo realiza: ' + esc(s.realiza) + '</div>' : '')
      + precio + paqHtml
      + (s.extra ? '<div class="ap-pextra">' + esc(s.extra) + '</div>' : '')
      + (s.incluye ? '<details class="ap-pincluye"><summary>Qué incluye</summary><p>' + esc(s.incluye) + '</p></details>' : '')
      + btn('Pedir', s.nombre) + '</div></div>';
  }
  function producto(s){
    var u = uno(s);
    return '<div class="ap-pfila"><div><div class="ap-pnombre ap-pnombre-sm">' + esc(s.nombre) + '</div>' + (s.incluye ? '<div class="ap-pquien" style="text-transform:none;letter-spacing:0;font-weight:400;">' + esc(s.incluye) + '</div>' : '') + '</div>'
      + '<div class="ap-pfila-der"><span class="ap-pprecio ap-pprecio-sm">' + (u != null ? money(u) : 'Consultar') + '</span>' + btn('Pedir', s.nombre, true) + '</div></div>';
  }
  function laser(rows){
    if(!rows.length) return '<p class="ap-pnota">Sin zonas cargadas.</p>';
    var grupos = []; rows.forEach(function(s){ var g = s.grupo || 'Zonas'; if(grupos.indexOf(g) < 0) grupos.push(g); });
    var v = function(n){ return n == null ? '—' : money(n); };
    var html = '<div class="ap-pbanda"><img src="' + FOTO_DIR + 'laser-axilas-2.jpg" alt=""/><div><b>Depilación láser · ' + (gen === 'hombre' ? 'Hombre' : 'Mujer') + '</b><span>Láser diodo · una sesión al mes · paquetes de 3 y 6 sesiones</span></div></div>';
    grupos.forEach(function(g){
      var zs = rows.filter(function(s){ return (s.grupo || 'Zonas') === g; });
      var foto = FOTO_GRUPO[norm(g).trim()];
      html += '<div class="ap-pgrupo' + (foto ? ' con-foto' : '') + '">' + (foto ? fotoHtml(FOTO_DIR + foto + '.jpg') : '')
        + '<div class="ap-pzonas"><h3>' + esc(g) + '</h3>'
        + '<div class="ap-pzona cab"><span>Zona</span><span>1</span><span>×3</span><span>×6</span><span></span></div>'
        + zs.map(function(s){
            var ps = paqs(s), p3 = null, p6 = null;
            ps.forEach(function(p){ if(p.sesiones === 3) p3 = p; if(p.sesiones === 6) p6 = p; });
            var u = uno(s);
            return '<div class="ap-pzona"><span>' + esc(s.nombre) + '</span><span>' + (u != null ? money(u) : 'Consultar') + '</span><span>' + v(p3 && p3.precio) + '</span><span>' + v(p6 && p6.precio) + '</span>'
              + btn('Pedir', 'Depilación láser · ' + s.nombre + ' (' + (gen === 'hombre' ? 'hombre' : 'mujer') + ')', true) + '</div>';
          }).join('')
        + '</div></div>';
    });
    var r0 = rows[0];
    html += '<p class="ap-pnota">Precios en soles.' + (r0.incluye ? ' ' + esc(r0.incluye) : '') + (r0.realiza ? ' Lo realizan: ' + esc(r0.realiza) + '.' : '') + '</p>';
    return html;
  }
  function promos(lista){
    return '<div class="ap-pgrid">' + lista.map(function(p){
      var fin = String(p.fin || '').slice(0, 10), mes = MESES[parseInt(fin.slice(5, 7), 10) - 1] || '';
      var finTxt = fin ? (parseInt(fin.slice(8, 10), 10) + ' de ' + mes) : '';
      return '<div class="ap-pcard">' + fotoHtml(fotoSrc(p.nombre + ' ' + (p.nota || ''), ''))
        + '<div class="ap-pbody"><span class="ap-ppromo">Promo de ' + esc(mes) + '</span><div class="ap-pnombre">' + esc(p.nombre) + '</div>'
        + (p.precio != null ? '<div class="ap-pprecio">' + money(p.precio) + '</div>' : '')
        + (finTxt ? '<div class="ap-pvence">Válida hasta el ' + esc(finTxt) + '</div>' : '')
        + (p.nota ? '<div class="ap-pincluye"><p>' + esc(p.nota) + '</p></div>' : '')
        + btn('Lo quiero', p.nombre) + '</div></div>';
    }).join('') + '</div>';
  }
  function htmlCategoria(c){
    if(c === PROMOS) return promos(promosActivas());
    var lista = ordenar(SERV.filter(function(s){ return s.categoria === c; }));
    if(c === LASER) return laser(lista.filter(function(s){ return s.genero === gen || s.genero === 'ambos'; }));
    if(c === PRODUCTOS) return '<div class="ap-plista">' + lista.map(producto).join('') + '</div>';
    return '<div class="ap-pgrid">' + lista.map(tarjeta).join('') + '</div>';
  }

  function render(){
    var chips = document.getElementById('pChips'), seg = document.getElementById('pGenero'), cuerpo = document.getElementById('pCuerpo');
    if(!cuerpo) return;
    var cats = categorias();
    if(!cat || cats.indexOf(cat) < 0) cat = cats.indexOf(LASER) >= 0 ? LASER : cats[0];
    if(chips) chips.innerHTML = cats.map(function(c, i){ return '<button type="button" class="ap-chip" aria-pressed="' + (c === cat ? 'true' : 'false') + '" onclick="pCategoria(' + i + ')">' + esc(c) + '</button>'; }).join('');
    if(seg){
      seg.parentNode.style.display = cat === LASER ? 'block' : 'none';
      seg.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-g') === gen ? 'true' : 'false'); });
    }
    cnt = {};
    cuerpo.innerHTML = htmlCategoria(cat);
  }
  window.pCategoria = function(i){ var cats = categorias(); if(cats[i]){ cat = cats[i]; render(); } };
  window.pGenero = function(g){ gen = g; render(); };

  // «Pedir» → WhatsApp
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-pedir]');
    if(b && typeof window.pedirWa === 'function'){ e.preventDefault(); window.pedirWa(b.getAttribute('data-pedir')); }
  });

  // ---- carga: Supabase y, si falla, la copia local ----
  function fetchJson(url, headers){ return fetch(url, { headers: headers || {}, cache: 'no-store' }).then(function(r){ return r.ok ? r.json() : null; }); }
  function cargarLocal(){
    return fetchJson('data/precios.json?v=1').then(function(d){ SERV = (d && d.servicios) || []; PROMO = (d && d.promociones) || []; });
  }
  function cargar(){
    var c = (typeof CONFIG !== 'undefined') ? CONFIG : null;
    var p;
    if(c && c.SUPABASE_URL && c.SUPABASE_ANON){
      var h = { 'apikey': c.SUPABASE_ANON, 'Authorization': 'Bearer ' + c.SUPABASE_ANON };
      p = Promise.all([
        fetchJson(c.SUPABASE_URL + '/rest/v1/precios_servicios?select=categoria,grupo,nombre,genero,incluye,realiza,precio_sesion,paquetes,extra,consultar,orden&activo=eq.true&order=orden.asc', h),
        fetchJson(c.SUPABASE_URL + '/rest/v1/precios_promociones?select=nombre,precio,nota,inicio,fin,orden&order=orden.asc', h)
      ]).then(function(r){
        if(!Array.isArray(r[0]) || !r[0].length) throw new Error('sin datos');
        SERV = r[0]; PROMO = Array.isArray(r[1]) ? r[1] : [];
      }).catch(cargarLocal);
    } else {
      p = cargarLocal();
    }
    p.then(render).catch(function(){
      var cuerpo = document.getElementById('pCuerpo');
      if(cuerpo) cuerpo.innerHTML = '<p class="ap-pnota">No pudimos cargar los precios ahora. Escríbenos por WhatsApp y te los pasamos.</p>';
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cargar); else cargar();
})();
