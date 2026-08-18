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
      // Número de WhatsApp configurado desde el editor
      if(c.whatsapp){
        window._WA_NUM = String(c.whatsapp).replace(/\D/g,'');
        if(typeof CONFIG !== 'undefined') CONFIG.WHATSAPP = window._WA_NUM;
        var msg = encodeURIComponent('Hola, quiero información sobre sus servicios');
        var url = 'https://wa.me/' + window._WA_NUM + '?text=' + msg;
        ['waHero','waUbicacion','waFooter'].forEach(function(id){
          var el = document.getElementById(id);
          if(el){ el.href = url; el.hidden = false; }
        });
      }
      if(c.instagram_reels && c.instagram_reels.length){
        var marcos = document.querySelectorAll('.reel-marco iframe');
        c.instagram_reels.slice(0,3).forEach(function(u, i){
          if(marcos[i] && u){
            var limpio = String(u).trim().replace(/\/$/,'').split('?')[0];
            marcos[i].src = limpio + '/embed/';
          }
        });
      }
      // Feed de Instagram automático (Behold): si está puesto, manda sobre los videos fijos
      if(c.behold_feed){
        window._BEHOLD_FEED = String(c.behold_feed).trim();
        if(typeof window.cargarInstagram === 'function') window.cargarInstagram();
      }
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
