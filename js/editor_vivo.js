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
    + '#elleChatBtn, .elle-chat-btn, #waFlotante{ display:none !important; }'
    + 'html.js .rv{ opacity:1 !important; transform:none !important; } html.js .rv-words .w{ opacity:1 !important; transform:none !important; filter:none !important; }';
  document.head.appendChild(css);

  var activo = null;
  function marcar(el){ if(activo) activo.classList.remove('ev-activo'); activo = el; if(el) el.classList.add('ev-activo'); }

  // Botón «Cambiar foto» sobre cada foto o video editable
  var ICONO = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
  function botonesFoto(){
    document.querySelectorAll('.ev-foto').forEach(function(b){ b.remove(); });
    document.querySelectorAll('[data-edit-img]').forEach(function(el){
      if(!el.offsetParent && el.tagName !== 'VIDEO') return;
      var r = el.getBoundingClientRect();
      if(r.width < 40 || r.height < 40) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ev-foto'; b.innerHTML = ICONO + ' Cambiar foto o video';
      b.style.left = (r.left + window.scrollX + 14) + 'px';
      b.style.top = (r.top + window.scrollY + 14) + 'px';
      b.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var src = el.currentSrc || el.src || ((el.querySelector && el.querySelector('source')) || {}).src || '';
        enviar({ tipo: 'imagen', clave: el.getAttribute('data-edit-img'), valor: src, esVideo: el.tagName === 'VIDEO' });
      });
      document.body.appendChild(b);
    });
  }
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

  window.addEventListener('message', function(e){
    if(PADRES.indexOf(e.origin) < 0) return;
    var m = e.data || {};
    if(m.tipo === 'aplicar' && m.clave){
      document.querySelectorAll('[data-edit="' + m.clave + '"]').forEach(function(el){
        el.textContent = m.valor;
        if(el.classList.contains('rv-words') && typeof window.apPartirPalabras === 'function') window.apPartirPalabras(el);
        el.classList.add('on');
      });
      if(window._WEB_CONTENIDO) window._WEB_CONTENIDO[m.clave] = m.valor;
    }
    if(m.tipo === 'aplicar-img' && m.clave && m.valor){
      document.querySelectorAll('[data-edit-img="' + m.clave + '"]').forEach(function(el){ if(window.apAplicarImg) window.apAplicarImg(el, m.valor); });
      if(window._WEB_CONTENIDO) window._WEB_CONTENIDO[m.clave] = m.valor;
      reubicar();
    }
    if(m.tipo === 'recargar-catalogo' && typeof window.cargarCatalogo === 'function'){ window.cargarCatalogo(); }
    if(m.tipo === 'recargar-textos'){ location.reload(); }
    if(m.tipo === 'ir' && m.vista && typeof window.verVista === 'function'){ window.verVista(m.vista); reubicar(); }
    if(m.tipo === 'quitar'){ marcar(null); }
  });

  enviar({ tipo: 'listo' });
})();
