// elle studio · Aplica el contenido editable (contenido.json) sobre la página.
// Las claves se marcan en el HTML con data-edit (textos) y data-edit-img (imágenes).
// El archivo contenido.json se edita desde editor.html (la dueña puede cambiar todo).
(function(){
  fetch('contenido.json?v=' + Date.now(), { cache: 'no-store' })
    .then(function(r){ return r.ok ? r.json() : {}; })
    .then(function(c){
      if(!c || typeof c !== 'object') return;
      Object.keys(c).forEach(function(clave){
        var valor = c[clave];
        if(valor === null || valor === undefined || valor === '') return;
        document.querySelectorAll('[data-edit="' + clave + '"]').forEach(function(el){
          el.textContent = valor;
        });
        document.querySelectorAll('[data-edit-img="' + clave + '"]').forEach(function(el){
          el.src = valor;
        });
      });
    })
    .catch(function(){ /* sin contenido.json la página usa sus textos por defecto */ });
})();
