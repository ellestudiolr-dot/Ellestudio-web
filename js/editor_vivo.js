// elle studio · Modo editor (cuando la página se abre dentro del CRM con ?editar=1)
// Textos (data-edit), fotos/videos (data-edit-img) y bloques del catálogo se pueden tocar: la página le avisa
// al CRM, el CRM muestra el panel y, al guardar, manda el cambio para verlo al instante.
(function(){
  if(!window._MODO_EDITOR || window.parent === window) return;
  var PADRES = ['https://ellestudio.vercel.app', 'http://localhost:8331', 'http://127.0.0.1:8331'];
  function enviar(msg){ try{ window.parent.postMessage(msg, '*'); }catch(e){} }

  var css = document.createElement('style');
  css.textContent = '[data-edit]{ outline:1px dashed rgba(184,149,90,.75); outline-offset:3px; cursor:pointer; border-radius:3px; transition:outline-color .15s, background .15s; }'
    + '[data-edit]:hover{ outline:2px solid #b8955a; background:rgba(184,149,90,.12); }'
    + '[data-edit].ev-activo{ outline:2px solid #3d4f30; background:rgba(61,79,48,.08); }'
    + '.ct-bloque[data-cat-id]{ cursor:pointer; }'
    + '.ct-bloque[data-cat-id]:hover{ outline:2px solid #b8955a; outline-offset:-2px; }'
    + '.ct-bloque.ev-activo{ outline:2px solid #3d4f30 !important; outline-offset:-2px; }'
    + '.ev-foto{ position:absolute; z-index:9000; display:inline-flex; align-items:center; gap:6px; background:#191c17; color:#fff; border:1px solid rgba(255,255,255,.35); border-radius:999px; padding:8px 14px; font:600 12px/1 -apple-system,BlinkMacSystemFont,"Inter",sans-serif; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,.35); }'
    + '.ev-foto:hover{ background:#3d4f30; }'
    + '.ev-foto-chica{ padding:7px; border-radius:50%; }'
    + '#elleChatBtn, .elle-chat-btn, #waFlotante{ display:none !important; }'
    + 'html.js .rv{ opacity:1 !important; transform:none !important; } html.js .rv-words .w{ opacity:1 !important; transform:none !important; filter:none !important; }';
  document.head.appendChild(css);

  var activo = null;
  function marcar(el){ if(activo) activo.classList.remove('ev-activo'); activo = el; if(el) el.classList.add('ev-activo'); }

  // Botón «Cambiar foto» sobre cada foto o video editable
  var ICONO = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
  // Un botón por foto/video, creado UNA sola vez y solo re-colocado (si se borraran y volvieran a crear, el clic se perdía)
  var botones = new Map(), presionando = false;
  function botonesFoto(){
    if(presionando) return;
    var vivos = new Set();
    document.querySelectorAll('[data-edit-img]').forEach(function(el){
      vivos.add(el);
      var b = botones.get(el);
      var visible = (el.offsetParent || el.tagName === 'VIDEO') && !el.classList.contains('ap-sin-media');
      var r = el.getBoundingClientRect();
      if(!visible || r.width < 24 || r.height < 24){ if(b) b.style.display = 'none'; return; }
      var chico = r.width < 220 || r.height < 70;   // logos y fotos pequeñas: solo el icono
      if(!b){
        b = document.createElement('button');
        b.type = 'button'; b.title = 'Cambiar foto o video';
        b.addEventListener('mousedown', function(){ presionando = true; });
        b.addEventListener('click', function(e){
          e.preventDefault(); e.stopPropagation(); presionando = false;
          var src = el.currentSrc || el.src || ((el.querySelector && el.querySelector('source')) || {}).src || '';
          marcar(null); fotoActiva = el.getAttribute('data-edit-img'); mostrarAyudaFoto(true);
          enviar({ tipo: 'imagen', clave: el.getAttribute('data-edit-img'), valor: el.classList.contains('ap-sin-media') ? 'ninguna' : src, esVideo: el.tagName === 'VIDEO' });
        });
        document.body.appendChild(b); botones.set(el, b);
      }
      var claseNueva = 'ev-foto' + (chico ? ' ev-foto-chica' : '');
      if(b.className !== claseNueva){ b.className = claseNueva; b.innerHTML = chico ? ICONO : ICONO + ' Cambiar foto o video'; }
      var arriba = r.top + window.scrollY + (chico ? 4 : 14);
      if(!chico && r.top + window.scrollY < 80) arriba += 80;   // la portada queda bajo la barra del menú: el botón baja para no tapar el logo
      b.style.display = ''; b.style.left = (r.left + window.scrollX + (chico ? 4 : 14)) + 'px'; b.style.top = arriba + 'px';
    });
    botones.forEach(function(b, el){ if(!vivos.has(el) || !el.isConnected){ b.remove(); botones.delete(el); } });
  }
  document.addEventListener('mouseup', function(){ presionando = false; });
  var pendiente = null;
  function reubicar(){ clearTimeout(pendiente); pendiente = setTimeout(botonesFoto, 120); }
  window.addEventListener('scroll', reubicar, { passive: true });
  window.addEventListener('resize', reubicar);
  new MutationObserver(reubicar).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'src'] });
  setTimeout(botonesFoto, 600);

  document.addEventListener('click', function(e){
    var t = e.target;
    if(t.closest && t.closest('.ev-foto')) return;
    var el = t.closest && t.closest('[data-edit]');
    if(el){
      fotoActiva = null; mostrarAyudaFoto(false);
      e.preventDefault(); e.stopPropagation();
      marcar(el);
      enviar({ tipo: 'texto', clave: el.getAttribute('data-edit'), valor: el.textContent.replace(/\s+/g, ' ').trim() });
      return;
    }
    var bloque = t.closest && t.closest('.ct-bloque[data-cat-id]');
    if(bloque && !t.closest('button')){
      e.preventDefault(); e.stopPropagation();
      marcar(bloque);
      enviar({ tipo: 'catalogo', id: bloque.getAttribute('data-cat-id') });
      return;
    }
    // en modo editor no se abren WhatsApp, reservas ni enlaces externos
    var ext = t.closest && t.closest('a[target="_blank"], [data-pedir], [onclick*="abrirReserva"], [onclick*="pedirWa"], .ap-mapa-card');
    if(ext){ e.preventDefault(); e.stopPropagation(); }
  }, true);

  // ===== Ubicar la foto activa: arrastrar para moverla, rueda para acercar / alejar =====
  var fotoActiva = null, arrastre = null, ultimoEnvio = 0;
  var ayuda = document.createElement('div');
  ayuda.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9500;background:#191c17;color:#fff;border-radius:999px;padding:10px 18px;font:600 12px/1.2 -apple-system,BlinkMacSystemFont,"Inter",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);display:none;pointer-events:none;';
  ayuda.textContent = 'Arrastra sobre la foto para moverla · rueda del mouse para acercar o alejar';
  document.body.appendChild(ayuda);
  function mostrarAyudaFoto(si){ ayuda.style.display = si ? 'block' : 'none'; }
  function elFoto(){ if(!fotoActiva) return null; var l = document.querySelectorAll('[data-edit-img="' + fotoActiva + '"]'); for(var i = 0; i < l.length; i++){ var r = l[i].getBoundingClientRect(); if(r.width > 20 && r.height > 20) return l[i]; } return null; }
  function posActual(){ var a = String((window._WEB_CONTENIDO || {})[fotoActiva + '_pos'] || '50,50,1').split(',').map(Number); return { x: isFinite(a[0]) ? a[0] : 50, y: isFinite(a[1]) ? a[1] : 50, z: (isFinite(a[2]) && a[2] > 0) ? a[2] : 1 }; }
  function dentro(el, ev){ var r = el.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; }
  function aplicarPos(p, final){
    var valor = Math.round(p.x) + ',' + Math.round(p.y) + ',' + (Math.round(p.z * 100) / 100);
    if(window._WEB_CONTENIDO) window._WEB_CONTENIDO[fotoActiva + '_pos'] = valor;
    if(window.apPosImg) window.apPosImg(fotoActiva, valor);
    var ahora = Date.now();
    if(final || ahora - ultimoEnvio > 80){ ultimoEnvio = ahora; enviar({ tipo: 'pos-img-cambio', clave: fotoActiva, valor: valor }); }
  }
  function lim(v, a, b){ return Math.max(a, Math.min(b, v)); }
  document.addEventListener('pointerdown', function(ev){
    var el = elFoto(); if(!el || ev.button !== 0) return;
    if(ev.target.closest && (ev.target.closest('.ev-foto') || ev.target.closest('[data-edit]'))) return;
    if(!dentro(el, ev)) return;
    ev.preventDefault(); ev.stopPropagation();
    var r = el.getBoundingClientRect();
    arrastre = { x0: ev.clientX, y0: ev.clientY, p: posActual(), w: r.width, h: r.height };
  }, true);
  document.addEventListener('pointermove', function(ev){
    if(!arrastre) return;
    ev.preventDefault();
    var p = arrastre.p, f = 100 / Math.max(1, p.z);
    aplicarPos({ x: lim(p.x - (ev.clientX - arrastre.x0) / arrastre.w * f, 0, 100), y: lim(p.y - (ev.clientY - arrastre.y0) / arrastre.h * f, 0, 100), z: p.z }, false);
  }, true);
  document.addEventListener('pointerup', function(){ if(arrastre){ arrastre = null; aplicarPos(posActual(), true); } }, true);
  document.addEventListener('wheel', function(ev){
    var el = elFoto(); if(!el || !dentro(el, ev)) return;
    ev.preventDefault();
    var p = posActual(); p.z = lim(p.z - ev.deltaY * 0.0015, 0.5, 3);
    aplicarPos(p, true);
  }, { passive: false, capture: true });

  window.addEventListener('message', function(e){
    if(PADRES.indexOf(e.origin) < 0) return;
    var m = e.data || {};
    if(m.tipo === 'aplicar' && m.clave){
      document.querySelectorAll('[data-edit="' + m.clave + '"]').forEach(function(el){
        if(window.apAplicarTexto) window.apAplicarTexto(el, m.valor); else el.textContent = m.valor;
        el.classList.add('on');
      });
      if(window._WEB_CONTENIDO) window._WEB_CONTENIDO[m.clave] = m.valor;
      if(m.clave === 'navidad' && typeof window.apNavidad === 'function') window.apNavidad(m.valor);
    }
    if(m.tipo === 'aplicar-img' && m.clave && m.valor){
      document.querySelectorAll('[data-edit-img="' + m.clave + '"]').forEach(function(el){ if(window.apAplicarImg) window.apAplicarImg(el, m.valor); });
      if(window._WEB_CONTENIDO) window._WEB_CONTENIDO[m.clave] = m.valor;
      reubicar();
    }
    // Vista previa sin guardar: el CRM manda el archivo elegido (foto, GIF o video) y aquí se muestra al instante
    if(m.tipo === 'previsualizar-img' && m.clave && m.archivo){
      var urlLocal = URL.createObjectURL(m.archivo);
      document.querySelectorAll('[data-edit-img="' + m.clave + '"]').forEach(function(el){ if(window.apAplicarImg) window.apAplicarImg(el, urlLocal, !!m.esVideo); });
      if(window._WEB_CONTENIDO) window._WEB_CONTENIDO[m.clave] = urlLocal;
      reubicar();
    }
    if(m.tipo === 'quitar-img' && m.clave){
      document.querySelectorAll('[data-edit-img="' + m.clave + '"]').forEach(function(el){ if(window.apQuitarImg) window.apQuitarImg(el); });
      if(window._WEB_CONTENIDO) window._WEB_CONTENIDO[m.clave] = 'ninguna';
      reubicar();
    }
    if(m.tipo === 'restaurar-img' && m.clave){
      if(window.apRestaurarImg) window.apRestaurarImg(m.clave);
      if(window._WEB_CONTENIDO) window._WEB_CONTENIDO[m.clave] = '';
      reubicar();
    }
    if(m.tipo === 'catalogo-preview' && m.item && typeof window.apCatalogoPreview === 'function'){
      window.apCatalogoPreview(m.item);
      var bq = document.querySelector('.ct-bloque[data-cat-id="' + m.item.id + '"]'); if(bq) marcar(bq);
      reubicar();
    }
    if(m.tipo === 'recargar-catalogo' && typeof window.cargarCatalogo === 'function'){ window.cargarCatalogo(); }
    if(m.tipo === 'recargar-textos'){ location.reload(); }
    if(m.tipo === 'ir' && m.vista && typeof window.verVista === 'function'){ window.verVista(m.vista); reubicar(); }
    if(m.tipo === 'quitar'){ marcar(null); fotoActiva = null; arrastre = null; mostrarAyudaFoto(false); }
    if(m.tipo === 'pos-img' && m.clave){
      if(window._WEB_CONTENIDO) window._WEB_CONTENIDO[m.clave + '_pos'] = m.valor;
      if(window.apPosImg) window.apPosImg(m.clave, m.valor);
      reubicar();
    }
  });

  enviar({ tipo: 'listo' });
})();
