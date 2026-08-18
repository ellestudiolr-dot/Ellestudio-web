// elle studio · Instagram automático
// Trae solos los últimos videos de @_elleestudio y los pone en la sección de Instagram.
// El enlace del feed se pone en CONFIG.BEHOLD_FEED (js/reserva.js) o desde el editor
// (contenido.json → behold_feed). Sin enlace, la página deja los videos que ya tiene puestos.
(function(){

  var CUANTOS = 3;   // la sección tiene 3 espacios

  function feedUrl(){
    var u = (window._BEHOLD_FEED || '') || (typeof CONFIG !== 'undefined' ? (CONFIG.BEHOLD_FEED || '') : '');
    return String(u).trim();
  }

  // De un enlace de Instagram saca el que sirve para incrustar el video
  function aEmbed(permalink){
    var limpio = String(permalink || '').trim().split('?')[0].replace(/\/$/, '');
    return limpio ? limpio + '/embed/' : '';
  }

  function pintar(posts){
    var caja = document.getElementById('reelsIG');
    if(!caja || !posts.length) return;
    caja.innerHTML = posts.map(function(p){
      var src = aEmbed(p.permalink);
      if(!src) return '';
      return '<div class="reel-marco"><iframe src="' + src + '" loading="lazy" allowfullscreen scrolling="no" title="Publicación de elle studio"></iframe></div>';
    }).join('');
  }

  window.cargarInstagram = function(){
    var url = feedUrl();
    if(!url) return;                          // sin conectar: se quedan los videos actuales
    fetch(url, {cache:'no-store'})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        if(!data || !Array.isArray(data.posts)) return;
        // Solo videos (reels), del más nuevo al más viejo
        var videos = data.posts.filter(function(p){
          return p && p.permalink && (p.mediaType === 'VIDEO' || p.isReel === true);
        }).slice(0, CUANTOS);
        if(videos.length) pintar(videos);      // si no hay videos nuevos, no se toca nada
      })
      .catch(function(){});                    // si Instagram o el servicio fallan, se quedan los actuales
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', window.cargarInstagram);
  } else {
    window.cargarInstagram();
  }

})();
