// elle studio · Textos editables de la página
// Los textos viven en la tabla web_contenido de Supabase y se editan desde el CRM (pestaña «Página web»).
// Cada elemento con data-edit="clave" muestra el valor guardado; si la base no responde, se queda el texto del HTML.
(function(){
  window._WEB_CONTENIDO = {};

  function aplicar(mapa){
    window._WEB_CONTENIDO = mapa;
    Object.keys(mapa).forEach(function(clave){
      var valor = mapa[clave];
      if(valor === null || valor === undefined || String(valor).trim() === '') return;
      document.querySelectorAll('[data-edit="' + clave + '"]').forEach(function(el){
        el.textContent = valor;
        // los títulos que entran palabra por palabra se vuelven a partir
        if(el.classList.contains('rv-words') && typeof window.apPartirPalabras === 'function') window.apPartirPalabras(el);
      });
      document.querySelectorAll('[data-edit-img="' + clave + '"]').forEach(function(el){ el.src = valor; });
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
