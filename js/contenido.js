// elle studio · Aplica el contenido editable (contenido.json) sobre la página.
// Textos: data-edit  ·  Imágenes: data-edit-img  ·  Galería: clave "galeria" (lista)
// El archivo contenido.json se edita desde editor.html.
(function(){

  // Fotos de la galería por defecto (si aún no se agregaron desde el editor)
  var GALERIA_DEFECTO = [
    { src: 'img/spa-ambiente.jpg',   pie: 'Recepción y ambiente' },
    { src: 'img/facial.jpg',         pie: 'Cabina de faciales' },
    { src: 'img/corporal.jpg',       pie: 'Cabina de corporales' },
    { src: 'img/laser-piernas.jpg',  pie: 'Zona de depilación láser' }
  ];

  function pintarGaleria(lista){
    var cont = document.getElementById('galeriaEstudio');
    if(!cont) return;
    if(!lista || !lista.length) lista = GALERIA_DEFECTO;
    cont.innerHTML = lista.map(function(f, i){
      var src = (typeof f === 'string') ? f : (f && f.src);
      if(!src) return '';
      var pie = (typeof f === 'object' && f.pie) ? f.pie : '';
      // La primera ocupa el ancho completo; el resto van de dos en dos
      var ancha = (i === 0) ? ' md:col-span-2' : '';
      var alto  = (i === 0) ? '420px' : '340px';
      return '<div class="foto-galeria' + ancha + '" style="height:' + alto + ';">' +
               '<img src="' + src + '" alt="' + (pie || 'elle studio') + '" loading="lazy"/>' +
               (pie ? '<div class="pie">' + pie + '</div>' : '') +
             '</div>';
    }).join('');
  }

  fetch('contenido.json?v=' + Date.now(), { cache: 'no-store' })
    .then(function(r){ return r.ok ? r.json() : {}; })
    .then(function(c){
      c = (c && typeof c === 'object') ? c : {};
      Object.keys(c).forEach(function(clave){
        var valor = c[clave];
        if(valor === null || valor === undefined || valor === '' || clave === 'galeria') return;
        document.querySelectorAll('[data-edit="' + clave + '"]').forEach(function(el){
          el.textContent = valor;
        });
        document.querySelectorAll('[data-edit-img="' + clave + '"]').forEach(function(el){
          el.src = valor;
        });
      });
      pintarGaleria(c.galeria);
    })
    .catch(function(){ pintarGaleria(null); });
})();
