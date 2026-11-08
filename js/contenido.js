// elle studio · Textos, fotos y videos editables de la página
// Viven en la tabla web_contenido de Supabase y se editan desde el CRM (pestaña «Página web»).
// data-edit="clave"      → texto
// data-edit-img="clave"  → foto, GIF o video (si está vacío se queda el archivo original del código)
// «clave_pos»            → cómo se ubica esa foto: «x,y,zoom» (x e y en %, zoom 1 = normal)
// La página se ACTUALIZA SOLA: cada pocos segundos (y al volver a la pestaña) trae lo que se guardó en el CRM.
(function(){
  window._WEB_CONTENIDO = {};
  window._WEB_ORIGINALES = {};   // HTML original (del código) de cada foto/video, para poder volver a él sin recargar
  var ORIG_TXT = {};             // texto original (del código) de cada clave, para volver a él si se deja vacío
  var ultimo = '';               // fecha del último cambio que ya está en la página

  var cssOculta = document.createElement('style'); cssOculta.textContent = '.ap-sin-media{ display:none !important; }'; document.head.appendChild(cssOculta);

  // Deja el hueco sin foto ni video (valor «ninguna» en web_contenido)
  window.apQuitarImg = function(el){
    if(!el) return;
    guardarOriginal(el);
    el.classList.add('ap-sin-media');
    if(el.tagName === 'VIDEO'){ try{ el.pause(); }catch(e){} }
  };

  function guardarOriginal(el){
    var k = el && el.getAttribute && el.getAttribute('data-edit-img');
    if(k && !window._WEB_ORIGINALES[k]) window._WEB_ORIGINALES[k] = el.outerHTML;
  }
  // Íconos dentro de un texto editable (flecha, logo de Instagram, ícono de ubicación…): no se tocan al cambiar el texto
  function esIcono(n){
    if(n.nodeType !== 1) return false;
    var tag = n.tagName.toLowerCase(), cl = String(n.className && n.className.baseVal !== undefined ? n.className.baseVal : n.className || '');
    return tag === 'svg' || tag === 'i' || /material-symbols|material-icons/.test(cl) || n.getAttribute('aria-hidden') === 'true';
  }
  // El texto que se edita, sin el nombre de los íconos (p. ej. «location_on»)
  window.apTextoDe = function(el){
    if(!el) return '';
    var c = el.cloneNode(true);
    c.querySelectorAll('svg, i, .material-symbols-outlined, .material-icons, [aria-hidden="true"]').forEach(function(x){ x.remove(); });
    return c.textContent.replace(/\s+/g, ' ').trim();
  };
  function ponerTexto(el, valor){
    var iconos = [].some.call(el.children, esIcono);
    if(!iconos){ el.textContent = valor; return; }
    var nodos = [];
    el.childNodes.forEach(function(n){ if(n.nodeType === 3 && n.nodeValue.trim()) nodos.push(n); });
    if(!nodos.length){ el.appendChild(document.createTextNode(' ' + valor)); return; }
    var principal = nodos.reduce(function(a, b){ return b.nodeValue.trim().length > a.nodeValue.trim().length ? b : a; });
    principal.nodeValue = (/^\s/.test(principal.nodeValue) ? ' ' : '') + valor + (/\s$/.test(principal.nodeValue) ? ' ' : '');
    nodos.forEach(function(n){ if(n !== principal) n.nodeValue = ' '; });
  }
  function guardarTextoOriginal(el){
    var k = el && el.getAttribute && el.getAttribute('data-edit');
    if(!k || ORIG_TXT[k]) return;
    ORIG_TXT[k] = { txt: window.apTextoDe(el), hasta: el.getAttribute('data-hasta'), pre: el.getAttribute('data-pre'), suf: el.getAttribute('data-suf') };
  }

  // Ubica la foto: object-position (hacia dónde mira) + zoom (acercar / alejar), sin deformarla
  window.apPosImg = function(clave, valor){
    var p = String(valor || '').split(',').map(function(x){ return parseFloat(x); });
    var x = isFinite(p[0]) ? p[0] : 50, y = isFinite(p[1]) ? p[1] : 50, z = (isFinite(p[2]) && p[2] > 0) ? p[2] : 1;
    var normal = !valor || (x === 50 && y === 50 && z === 1);
    document.querySelectorAll('[data-edit-img="' + clave + '"]').forEach(function(el){
      if(normal){ el.style.objectPosition = ''; el.style.transform = ''; el.style.transformOrigin = ''; return; }
      el.style.objectPosition = x + '% ' + y + '%';
      if(z !== 1){
        el.style.transform = 'scale(' + z + ')'; el.style.transformOrigin = x + '% ' + y + '%';
        var padre = el.parentElement;   // que el zoom no se salga de su recuadro
        if(padre && getComputedStyle(padre).overflow === 'visible') padre.style.overflow = 'hidden';
      } else { el.style.transform = ''; el.style.transformOrigin = ''; }
    });
  };
  function reponerPos(clave){ var v = window._WEB_CONTENIDO[clave + '_pos']; if(v) window.apPosImg(clave, v); }

  // Cambia una foto/GIF/video. Si el elemento es un video y llega una imagen, el video se reemplaza por la imagen (y al revés).
  // esVideoForzado: true/false cuando la dirección no dice qué es (p. ej. una vista previa local del editor).
  window.apAplicarImg = function(el, valor, esVideoForzado){
    if(!el || !valor) return;
    if(valor === 'ninguna'){ window.apQuitarImg(el); return; }
    guardarOriginal(el);
    el.classList.remove('ap-sin-media');
    var clave = el.getAttribute('data-edit-img');
    var esVideo = (typeof esVideoForzado === 'boolean') ? esVideoForzado : /\.(mp4|webm|mov)(\?|$)/i.test(valor);
    if(el.tagName === 'VIDEO'){
      if(esVideo){
        el.querySelectorAll('source').forEach(function(s){ s.src = valor; });
        if(!el.querySelector('source')) el.src = valor;
        el.load(); var p = el.play(); if(p && p.catch) p.catch(function(){});
      } else {
        var img = document.createElement('img');
        img.src = valor; img.alt = ''; img.className = 'ap-media';
        img.setAttribute('data-edit-img', clave);
        el.replaceWith(img);
      }
    } else if(el.tagName === 'IMG'){
      if(esVideo){
        var v = document.createElement('video');
        v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
        v.className = el.className || 'ap-media'; v.setAttribute('data-video', ''); v.setAttribute('data-edit-img', clave);
        var s = document.createElement('source'); s.src = valor; s.type = 'video/mp4'; v.appendChild(s);
        el.replaceWith(v); var pp = v.play(); if(pp && pp.catch) pp.catch(function(){});
      } else {
        el.src = valor;
      }
    }
    reponerPos(clave);
  };

  // Vuelve al archivo original del código (el que había antes de cualquier cambio)
  window.apRestaurarImg = function(clave){
    var html = window._WEB_ORIGINALES[clave];
    if(!html) return false;
    document.querySelectorAll('[data-edit-img="' + clave + '"]').forEach(function(el){
      el.insertAdjacentHTML('beforebegin', html);
      var nuevo = el.previousElementSibling; el.remove();
      if(nuevo && nuevo.tagName === 'VIDEO'){ nuevo.muted = true; nuevo.load(); var p = nuevo.play(); if(p && p.catch) p.catch(function(){}); }
    });
    reponerPos(clave);
    return true;
  };

  // Cambia un texto. Si es un contador animado (data-hasta) también actualiza el número al que sube.
  window.apAplicarTexto = function(el, valor){
    if(!el) return;
    if(el.hasAttribute('data-hasta')){
      var m = String(valor).match(/^(\D*)([\d.,\s]+)(\D*)$/);
      if(m){ var n = parseInt(m[2].replace(/[^\d]/g, ''), 10); if(!isNaN(n)){ el.setAttribute('data-hasta', String(n)); el.setAttribute('data-pre', m[1]); el.setAttribute('data-suf', m[3]); } }
    }
    ponerTexto(el, valor);
    if(el.classList.contains('rv-words') && typeof window.apPartirPalabras === 'function') window.apPartirPalabras(el);
  };

  // Aplica UNA clave: texto, foto/video o posición de foto. Vacío = vuelve a lo original del código.
  function aplicarUno(clave, valor){
    window._WEB_CONTENIDO[clave] = valor;
    var vacio = valor === null || valor === undefined || String(valor).trim() === '';
    if(/_pos$/.test(clave)){ window.apPosImg(clave.replace(/_pos$/, ''), vacio ? '' : valor); return; }
    document.querySelectorAll('[data-edit="' + clave + '"]').forEach(function(el){
      if(!vacio){ window.apAplicarTexto(el, valor); return; }
      var o = ORIG_TXT[clave]; if(!o) return;
      if(o.hasta != null){ el.setAttribute('data-hasta', o.hasta); el.setAttribute('data-pre', o.pre || ''); el.setAttribute('data-suf', o.suf || ''); }
      window.apAplicarTexto(el, o.txt);
    });
    document.querySelectorAll('[data-edit-img="' + clave + '"]').forEach(function(el){
      if(!vacio) window.apAplicarImg(el, valor); else window.apRestaurarImg(clave);
    });
  }
  window.apAplicarClave = aplicarUno;

  function aplicar(mapa){
    window._WEB_CONTENIDO = mapa;
    document.querySelectorAll('[data-edit-img]').forEach(guardarOriginal);
    document.querySelectorAll('[data-edit]').forEach(guardarTextoOriginal);
    Object.keys(mapa).forEach(function(clave){
      var valor = mapa[clave];
      if(valor === null || valor === undefined || String(valor).trim() === '') return;
      aplicarUno(clave, valor);
    });
    document.dispatchEvent(new CustomEvent('web-contenido-listo', { detail: mapa }));
  }

  function conf(){ var c = (typeof CONFIG !== 'undefined') ? CONFIG : null; return (c && c.SUPABASE_URL && c.SUPABASE_ANON) ? c : null; }
  function pedir(c, consulta){
    return fetch(c.SUPABASE_URL + '/rest/v1/web_contenido?' + consulta, {
      headers: { 'apikey': c.SUPABASE_ANON, 'Authorization': 'Bearer ' + c.SUPABASE_ANON }, cache: 'no-store'
    }).then(function(r){ return r.ok ? r.json() : null; });
  }
  function marcar(filas){ filas.forEach(function(f){ if(f && f.actualizado && f.actualizado > ultimo) ultimo = f.actualizado; }); }

  function cargar(){
    var c = conf(); if(!c) return;
    pedir(c, 'select=clave,valor,actualizado')
      .then(function(filas){
        if(!Array.isArray(filas)) return;
        var mapa = {};
        filas.forEach(function(f){ if(f && f.clave) mapa[f.clave] = f.valor; });
        marcar(filas);
        aplicar(mapa);
      })
      .catch(function(){});
  }

  // Solo lo que cambió desde la última vez (consulta pequeña). En el editor del CRM no hace falta: el editor ya lo manda.
  var revisando = false;
  function revisar(){
    var c = conf();
    if(!c || !ultimo || revisando || window._MODO_EDITOR || document.hidden) return;
    revisando = true;
    pedir(c, 'select=clave,valor,actualizado&actualizado=gt.' + encodeURIComponent(ultimo) + '&order=actualizado.asc')
      .then(function(filas){
        if(!Array.isArray(filas) || !filas.length) return;
        var claves = [];
        filas.forEach(function(f){ if(f && f.clave){ aplicarUno(f.clave, f.valor); claves.push(f.clave); } });
        marcar(filas);
        document.dispatchEvent(new CustomEvent('web-contenido-cambio', { detail: { claves: claves } }));
      })
      .catch(function(){})
      .then(function(){ revisando = false; });
  }
  setInterval(revisar, 12000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) revisar(); });
  window.addEventListener('focus', revisar);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cargar); else cargar();
})();
