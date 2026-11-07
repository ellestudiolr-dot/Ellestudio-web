// elle studio · Modo editor (cuando la página se abre dentro del CRM con ?editar=1)
// Cada texto editable (data-edit) y cada bloque del catálogo se puede tocar: la página le avisa al CRM,
// el CRM muestra el panel para cambiarlo y, al guardar, manda el nuevo texto para verlo al instante.
(function(){
  if(!window._MODO_EDITOR || window.parent === window) return;
  var PADRES = ['https://ellestudio.vercel.app', 'http://localhost:8331', 'http://127.0.0.1:8331'];
  function enviar(msg){ try{ window.parent.postMessage(msg, '*'); }catch(e){} }

  var css = document.createElement('style');
  css.textContent = '[data-edit]{ outline:1px dashed rgba(184,149,90,.75); outline-offset:3px; cursor:pointer; border-radius:3px; transition:outline-color .15s, background .15s; }'
    + '[data-edit]:hover{ outline:2px solid #b8955a; background:rgba(184,149,90,.12); }'
    + '[data-edit].ev-activo{ outline:2px solid #3d4f30; background:rgba(61,79,48,.08); }'
    + '.ct-bloque[data-cat-id], .ct-portada{ cursor:pointer; }'
    + '.ct-bloque[data-cat-id]:hover{ outline:2px solid #b8955a; outline-offset:-2px; }'
    + '.ct-bloque.ev-activo{ outline:2px solid #3d4f30 !important; outline-offset:-2px; }'
    + '#elleChatBtn, .elle-chat-btn, #waFlotante{ display:none !important; }'
    + 'html.js .rv{ opacity:1 !important; transform:none !important; } html.js .rv-words .w{ opacity:1 !important; transform:none !important; filter:none !important; }';
  document.head.appendChild(css);

  var activo = null;
  function marcar(el){ if(activo) activo.classList.remove('ev-activo'); activo = el; if(el) el.classList.add('ev-activo'); }

  document.addEventListener('click', function(e){
    var t = e.target;
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
    if(m.tipo === 'recargar-catalogo' && typeof window.cargarCatalogo === 'function'){ window.cargarCatalogo(); }
    if(m.tipo === 'recargar-textos'){ location.reload(); }
    if(m.tipo === 'ir' && m.vista && typeof window.verVista === 'function'){ window.verVista(m.vista); }
    if(m.tipo === 'quitar'){ marcar(null); }
  });

  enviar({ tipo: 'listo' });
})();
