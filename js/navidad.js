// elle studio · Modo navideño (se enciende/apaga desde el CRM: clave «navidad» = si / no en web_contenido)
// Gorro de Papá Noel (foto real, img/gorro-navidad.webp) sobre los logos + nieve suave. Todo se quita solo al apagarlo.
(function(){
  var ON = false, canvas = null, raf = 0, copos = [], sprites = [];
  var MOV_REDUCIDO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GORRO = 'img/gorro-navidad.webp?v=1';

  var css = '.nv-logo{ position:relative; display:inline-block; line-height:0; width:fit-content; max-width:100%; align-self:flex-start; flex:0 0 auto; }'
    + '.nv-gorro{ position:absolute; left:-10%; top:-20%; width:44%; height:auto; transform:rotate(-4deg); transform-origin:60% 90%; pointer-events:none; filter:drop-shadow(0 3px 4px rgba(0,0,0,.35)); }'
    + '#nvNieve{ position:fixed; inset:0; width:100%; height:100%; pointer-events:none; z-index:40; }'
    + 'html.js:not(.nv-editor) .nv-logo > .rv:not(.on) + .nv-gorro{ opacity:0; transform:rotate(-4deg) translateY(26px); }'
    + 'html.js .nv-logo > .rv + .nv-gorro{ transition:opacity .9s cubic-bezier(.22,.61,.36,1), transform .9s cubic-bezier(.22,.61,.36,1); }';

  var estilo = null;
  function ponerEstilo(){ if(estilo) return; estilo = document.createElement('style'); estilo.id = 'nvEstilo'; estilo.textContent = css; document.head.appendChild(estilo); }

  // Envuelve cada logo (nav, portada y pie) y le pone el gorro. El envoltorio se queda aunque el editor cambie la foto.
  function gorros(){
    document.querySelectorAll('[data-edit-img^="logo_"]').forEach(function(el){
      if(el.parentElement && el.parentElement.classList.contains('nv-logo')) return;
      var w = document.createElement('span');
      w.className = 'nv-logo';
      el.parentNode.insertBefore(w, el); w.appendChild(el);
      var g = document.createElement('img'); g.className = 'nv-gorro'; g.src = GORRO; g.alt = ''; g.setAttribute('aria-hidden', 'true'); g.decoding = 'async';
      w.appendChild(g);
    });
  }
  function quitarGorros(){
    document.querySelectorAll('.nv-logo').forEach(function(w){
      w.querySelectorAll('.nv-gorro').forEach(function(g){ g.remove(); });
      while(w.firstChild) w.parentNode.insertBefore(w.firstChild, w);
      w.remove();
    });
  }

  // Nieve suave: copos redondos con borde difuso (sprites pre-dibujados), tres profundidades, lentos; se pausa al cambiar de pestaña
  function sprite(radio, tono){
    var c = document.createElement('canvas'), s = Math.ceil(radio * 2) + 4; c.width = c.height = s;
    var x = c.getContext('2d'), g = x.createRadialGradient(s/2, s/2, 0, s/2, s/2, radio);
    g.addColorStop(0, 'rgba(' + tono + ',1)'); g.addColorStop(0.55, 'rgba(' + tono + ',.7)'); g.addColorStop(1, 'rgba(' + tono + ',0)');
    x.fillStyle = g; x.beginPath(); x.arc(s/2, s/2, radio, 0, Math.PI*2); x.fill();
    return c;
  }
  function nieve(){
    if(MOV_REDUCIDO || canvas) return;
    canvas = document.createElement('canvas'); canvas.id = 'nvNieve'; document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d'), W = 0, H = 0, ultimo = 0;
    sprites = [sprite(1.6, '255,255,255'), sprite(2.6, '255,255,255'), sprite(4.2, '255,255,255'), sprite(2.2, '240,230,212'), sprite(6, '255,255,255')];
    function nuevo(cualquiera){
      var capa = Math.random();   // 0-1: lejos → cerca
      var k = capa < 0.5 ? 0 : capa < 0.8 ? 1 : capa < 0.93 ? 2 : capa < 0.97 ? 3 : 4;
      return { x: Math.random() * W, y: cualquiera ? Math.random() * H : -14, k: k, v: 0.22 + capa * 0.55, a: Math.random() * Math.PI * 2, sw: 0.2 + capa * 0.5, o: (k === 4 ? 0.22 : 0.3 + capa * 0.5) };
    }
    function medir(){
      W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight;
      var n = Math.round(Math.min(110, Math.max(36, W / 14)));
      copos = []; for(var i = 0; i < n; i++) copos.push(nuevo(true));
    }
    function paso(t){
      raf = requestAnimationFrame(paso);
      if(document.hidden) return;
      var dt = Math.min(40, t - ultimo) / 16.7; ultimo = t;
      ctx.clearRect(0, 0, W, H);
      for(var i = 0; i < copos.length; i++){
        var c = copos[i];
        c.y += c.v * dt; c.a += 0.01 * dt; c.x += Math.sin(c.a) * c.sw * dt;
        if(c.y > H + 14 || c.x < -14 || c.x > W + 14) copos[i] = c = nuevo(false);
        var s = sprites[c.k]; ctx.globalAlpha = c.o; ctx.drawImage(s, c.x - s.width/2, c.y - s.height/2);
      }
      ctx.globalAlpha = 1;
    }
    medir(); window.addEventListener('resize', medir);
    raf = requestAnimationFrame(paso);
    canvas._medir = medir;
  }
  function quitarNieve(){
    if(!canvas) return;
    cancelAnimationFrame(raf); window.removeEventListener('resize', canvas._medir);
    canvas.remove(); canvas = null; copos = [];
  }

  function encender(){
    if(ON) return; ON = true;
    ponerEstilo(); if(window._MODO_EDITOR) document.documentElement.classList.add('nv-editor');
    gorros(); nieve();
    document.documentElement.classList.add('nv-on');
  }
  function apagar(){
    if(!ON) return; ON = false;
    quitarGorros(); quitarNieve();
    document.documentElement.classList.remove('nv-on');
  }
  function activo(v){ return /^\s*(si|sí|s|on|1|true)\s*$/i.test(String(v == null ? '' : v)); }

  // Si el editor cambia el logo, el gorro sigue en su sitio; si aparece un logo nuevo, se le pone
  var obs = new MutationObserver(function(){ if(ON) gorros(); });
  obs.observe(document.documentElement, { childList: true, subtree: true });

  window.apNavidad = function(valor){ if(activo(valor)) encender(); else apagar(); };
  function arrancar(){ var m = window._WEB_CONTENIDO || {}; window.apNavidad(m.navidad); }
  document.addEventListener('web-contenido-listo', arrancar);
  document.addEventListener('web-contenido-cambio', function(e){ var cl = (e.detail && e.detail.claves) || []; if(cl.indexOf('navidad') >= 0) arrancar(); });
  if(window._WEB_CONTENIDO && Object.keys(window._WEB_CONTENIDO).length) arrancar();
})();
