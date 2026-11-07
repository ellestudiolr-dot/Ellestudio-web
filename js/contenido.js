// elle studio · Textos, fotos y videos editables de la página
// Viven en la tabla web_contenido de Supabase y se editan desde el CRM (pestaña «Página web»).
// data-edit="clave"      → texto
// data-edit-img="clave"  → foto, GIF o video (si está vacío se queda el archivo original del código)
(function(){
  window._WEB_CONTENIDO = {};

  // Cambia una foto/GIF/video. Si el elemento es un video y llega una imagen, el video se reemplaza por la imagen.
  window.apAplicarImg = function(el, valor){
    if(!el || !valor) return;
    var esVideo = /\.(mp4|webm|mov)(\?|$)/i.test(valor);
    if(el.tagName === 'VIDEO'){
      if(esVideo){
        el.querySelectorAll('source').forEach(function(s){ s.src = valor; });
        if(!el.querySelector('source')) el.src = valor;
        el.load(); var p = el.play(); if(p && p.catch) p.catch(function(){});
      } else {
        var img = document.createElement('img');
        img.src = valor; img.alt = ''; img.className = 'ap-media';
        img.setAttribute('data-edit-img', el.getAttribute('data-edit-img'));
        el.replaceWith(img);
      }
    } else if(el.tagName === 'IMG'){
      if(esVideo){
        var v = document.createElement('video');
        v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
        v.className = el.className || 'ap-media'; v.setAttribute('data-video', ''); v.setAttribute('data-edit-img', el.getAttribute('data-edit-img'));
        var s = document.createElement('source'); s.src = valor; s.type = 'video/mp4'; v.appendChild(s);
        el.replaceWith(v); var pp = v.play(); if(pp && pp.catch) pp.catch(function(){});
      } else {
        el.src = valor;
      }
    }
  };

  function aplicar(mapa){
    window._WEB_CONTENIDO = mapa;
    Object.keys(mapa).forEach(function(clave){
      var valor = mapa[clave];
      if(valor === null || valor === undefined || String(valor).trim() === '') return;
      document.querySelectorAll('[data-edit="' + clave + '"]').forEach(function(el){
        el.textContent = valor;
        if(el.classList.contains('rv-words') && typeof window.apPartirPalabras === 'function') window.apPartirPalabras(el);
      });
      document.querySelectorAll('[data-edit-img="' + clave + '"]').forEach(function(el){ window.apAplicarImg(el, valor); });
    });
    document.dispatchEvent(new CustomEvent('web-contenido-listo', { detail: mapa }));
  }

  function cargar(){
    var c = (typeof CONFIG !== 'undefined') ? CONFIG : null;
    if(!c || !c.SUPABASE_URL || !c.SUPABASE_ANON){ return; }
    fetch(c.SUPABASE_URL + '/rest/v1/web_contenido?select=clave,valor', {
      headers: { 'apikey': c.SUPABASE_ANON, 'Authorization': 'Bearer ' + c.SUPABASE_ANON },
      cache: 'no-store'
    })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(filas){
        if(!Array.isArray(filas)) return;
        var mapa = {};
        filas.forEach(function(f){ if(f && f.clave) mapa[f.clave] = f.valor; });
        aplicar(mapa);
      })
      .catch(function(){});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cargar); else cargar();
})();
