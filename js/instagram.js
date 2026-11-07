// elle studio · Instagram al final del inicio
// 1) Si está conectado Behold (CONFIG.BEHOLD_FEED en js/reserva.js, o behold_feed en el editor),
//    trae solas las últimas publicaciones de @_elleestudio y se actualizan sin tocar la página.
// 2) Si no, usa la lista local data/instagram.json (fotos guardadas en img/ig/).
// Se muestran las 6 últimas en cuadrícula; cada tarjeta lleva directo a la publicación en Instagram.
(function(){

  var CUANTOS = 6;
  var CUENTA = '_elleestudio';

  function feedUrl(){
    var u = (window._BEHOLD_FEED || '') || (typeof CONFIG !== 'undefined' ? (CONFIG.BEHOLD_FEED || '') : '');
    return String(u).trim();
  }
  function esc(s){ return String(s || '').replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function tarjeta(p){
    var perm = p.permalink || ('https://www.instagram.com/' + CUENTA + '/');
    var cap = String(p.caption || '').replace(/\s+/g, ' ').trim();
    if(cap.length > 120) cap = cap.slice(0, 120).replace(/\s\S*$/, '') + '…';
    var esVideo = p.tipo === 'video' || p.mediaType === 'VIDEO' || p.isReel === true;
    var img = p.imagen
      || (p.sizes && p.sizes.medium && p.sizes.medium.mediaUrl)
      || p.thumbnailUrl || p.mediaUrl || '';
    if(!img) return '';
    var play = esVideo
      ? '<span class="play"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>'
      : '';
    return '<a class="ap-ig-post" href="' + esc(perm) + '" target="_blank" rel="noopener">'
         + '<img src="' + esc(img) + '" alt="Publicación de Instagram de elle studio" loading="lazy" referrerpolicy="no-referrer"/>'
         + '<div class="velo"></div>' + play
         + '<div class="texto"><small>@' + CUENTA + '</small><p>' + esc(cap) + '</p></div></a>';
  }

  function pintar(posts){
    var caja = document.getElementById('reelsIG');
    if(!caja) return;
    var html = posts.slice(0, CUANTOS).map(tarjeta).join('');
    if(!html) return;
    caja.innerHTML = html;
    // cada tarjeta entra con el mismo efecto que el resto de la página
    if(window.IntersectionObserver){
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('on', e.isIntersecting); }); }, { threshold: 0.1 });
      caja.querySelectorAll('.ap-ig-post').forEach(function(el){ el.classList.add('rv'); io.observe(el); });
    }
  }

  function clave(p){ return String(p.permalink || '').replace(/\/+$/, ''); }

  // Completa hasta CUANTOS con el respaldo local (publicaciones anteriores guardadas en el sitio)
  function completar(frescas){
    fetch('data/instagram.json?v=1', {cache: 'no-store'})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        var lista = frescas.slice();
        var vistas = {};
        lista.forEach(function(p){ vistas[clave(p)] = true; });
        ((d && d.posts) || []).forEach(function(p){
          if(lista.length < CUANTOS && p && p.permalink && !vistas[clave(p)]){ lista.push(p); vistas[clave(p)] = true; }
        });
        pintar(lista);
      })
      .catch(function(){ pintar(frescas); });
  }

  function cargarLocal(){ completar([]); }

  // Behold (si algún día se conecta la cuenta ahí)
  function cargarBehold(){
    var url = feedUrl();
    if(!url){ cargarLocal(); return; }
    fetch(url, {cache: 'no-store'})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        var posts = data && Array.isArray(data.posts) ? data.posts.filter(function(p){ return p && p.permalink; }) : [];
        if(posts.length) completar(posts.slice(0, CUANTOS)); else cargarLocal();
      })
      .catch(cargarLocal);
  }

  // Supabase: la tabla web_instagram se actualiza sola cada hora con lo último de @_elleestudio (de la más reciente a la más antigua)
  window.cargarInstagram = function(){
    var c = (typeof CONFIG !== 'undefined') ? CONFIG : null;
    if(!c || !c.SUPABASE_URL || !c.SUPABASE_ANON){ cargarBehold(); return; }
    fetch(c.SUPABASE_URL + '/rest/v1/web_instagram?select=shortcode,permalink,imagen,es_video,caption,publicado&order=publicado.desc.nullslast,orden.asc&limit=' + CUANTOS, {
      headers: { 'apikey': c.SUPABASE_ANON, 'Authorization': 'Bearer ' + c.SUPABASE_ANON },
      cache: 'no-store'
    })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(filas){
        if(!Array.isArray(filas) || !filas.length){ cargarBehold(); return; }
        completar(filas.map(function(f){
          return { permalink: f.permalink, imagen: f.imagen, tipo: f.es_video ? 'video' : 'foto', caption: f.caption || '' };
        }));
      })
      .catch(cargarBehold);
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', window.cargarInstagram);
  } else {
    window.cargarInstagram();
  }

})();
