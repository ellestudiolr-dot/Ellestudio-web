// elle studio · página pública (estilo Apple)
// - Cada pestaña del menú es una "vista" (inicio, tratamientos, precios, estudio, ubicación):
//   se muestra solo la que toca y se sube al inicio, como siempre fue.
// - Popup de reserva + chips (mismos ids: modalReserva, servicio, chipsReserva)
// - Textos que aparecen al entrar en pantalla y desaparecen al salir (.rv y .rv-words)
// - Videos en silencio, solo se reproducen cuando están en pantalla
(function(){
  document.documentElement.classList.add('js');

  var VISTAS = ['inicio', 'tratamientos', 'precios', 'estudio', 'ubicacion'];
  // Nombres viejos o anclas internas → vista que las contiene
  var ALIAS = { servicios:'tratamientos', catalogo:'precios', ofertas:'inicio', 'como-funciona':'inicio', como:'inicio', faq:'inicio', instagram:'inicio', reservar:'inicio', reserva:'inicio' };

  function vistaDe(v){ v = ALIAS[v] || v; return VISTAS.indexOf(v) >= 0 ? v : 'inicio'; }

  window.verVista = function(v){
    v = vistaDe(v);
    document.querySelectorAll('.vista').forEach(function(s){
      s.classList.toggle('activa', s.getAttribute('data-vista') === v);
    });
    document.querySelectorAll('[data-nav]').forEach(function(a){
      a.classList.toggle('nav-activa', a.getAttribute('data-nav') === v);
    });
    window.scrollTo(0, 0);
    try{ history.replaceState(null, '', '#' + v); }catch(e){}
    _ultimoHash = v;
    alScroll();
  };

  // Bajar suave a un bloque dentro de la vista actual (por ejemplo #ofertas en el inicio)
  function irA(id){
    var el = document.getElementById(id);
    if(!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  window._nav = function(v){
    if(ALIAS[v] && VISTAS.indexOf(v) < 0){ verVista(ALIAS[v]); setTimeout(function(){ irA(v); }, 120); }
    else verVista(v);
    return false;
  };
  window._navSvc = function(idCard){
    verVista('tratamientos');
    setTimeout(function(){
      var el = document.getElementById(idCard);
      if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    return false;
  };
  window.menuSvc = function(){};

  // Menú móvil (hamburguesa): se abre con el botón y se cierra al tocar fuera, con Escape, al bajar la página o eligiendo una opción
  var ICONO_MENU = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D8BC7E" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  var ICONO_X = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D8BC7E" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
  var velo = null, yAbierto = 0;
  function menuAbierto(){ var p = document.getElementById('menuMovilPanel'); return !!(p && p.style.display === 'block'); }
  function ponerMenu(abrir){
    var p = document.getElementById('menuMovilPanel'), b = document.querySelector('.ap-burger');
    if(!p) return;
    p.style.display = abrir ? 'block' : 'none';
    if(b){ b.innerHTML = abrir ? ICONO_X : ICONO_MENU; b.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Menú'); b.setAttribute('aria-expanded', abrir ? 'true' : 'false'); }
    if(!velo){
      velo = document.createElement('div'); velo.className = 'ap-menu-velo';
      velo.addEventListener('click', function(){ ponerMenu(false); });
      document.body.appendChild(velo);
    }
    velo.classList.toggle('on', abrir);
    if(abrir) yAbierto = window.scrollY;
  }
  window.cerrarMenuMovil = function(){ if(menuAbierto()) ponerMenu(false); };
  window.menuMovil = function(){ ponerMenu(!menuAbierto()); };
  window._navMovil = function(v){ ponerMenu(false); return _nav(v); };
  document.addEventListener('click', function(e){
    if(!menuAbierto()) return;
    var t = e.target;
    if(t.closest && (t.closest('#menuMovilPanel') || t.closest('.ap-burger'))) return;
    ponerMenu(false);
  }, true);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') window.cerrarMenuMovil(); });
  window.addEventListener('scroll', function(){ if(menuAbierto() && Math.abs(window.scrollY - yAbierto) > 60) ponerMenu(false); }, { passive: true });
  window.addEventListener('resize', function(){ if(window.innerWidth >= 860) window.cerrarMenuMovil(); });

  // Textos legales (pie): se leen de web_contenido (legal_*) y se editan desde el CRM
  var LEGAL_TITULOS = { privacidad:'Política de privacidad', terminos:'Términos y condiciones', accesibilidad:'Accesibilidad', reclamaciones:'Libro de reclamaciones' };
  window.verLegal = function(clave){
    var m = document.getElementById('legalModal'); if(!m) return;
    var textos = window._WEB_CONTENIDO || {};
    document.getElementById('legalTitulo').textContent = LEGAL_TITULOS[clave] || 'Información';
    document.getElementById('legalTexto').textContent = textos['legal_' + clave] || 'Escríbenos por WhatsApp y te lo enviamos.';
    m.style.display = 'flex'; document.body.style.overflow = 'hidden';
  };
  window.cerrarLegal = function(){ var m = document.getElementById('legalModal'); if(m){ m.style.display = 'none'; document.body.style.overflow = ''; } };

  // Popup de reserva
  window.abrirReserva = function(){
    var m = document.getElementById('modalReserva');
    if(m){ m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  };
  window.cerrarReserva = function(){
    var m = document.getElementById('modalReserva');
    if(m){ m.style.display = 'none'; document.body.style.overflow = ''; }
  };
  window.elegirSvc = function(btn, valor){
    var sel = document.getElementById('servicio');
    if(sel) sel.value = valor;
    document.querySelectorAll('#chipsReserva .chip-svc').forEach(function(c){ c.classList.remove('activo'); });
    if(btn) btn.classList.add('activo');
  };
  document.addEventListener('click', function(e){
    var m = document.getElementById('modalReserva');
    if(m && e.target === m) cerrarReserva();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ cerrarReserva(); cerrarLegal(); } });

  // Barra superior más sólida al bajar + el texto del inicio se desvanece con el scroll (como Apple)
  var nav = document.getElementById('apNav');
  var heroTexto = document.getElementById('heroTexto');
  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function alScroll(){
    var enInicio = !!document.querySelector('.ap-hero.activa');
    if(nav) nav.classList.toggle('con-fondo', window.scrollY > 40 || !enInicio);
    if(heroTexto && !reducir){
      var p = Math.min(1, window.scrollY / (window.innerHeight * 0.55));
      heroTexto.style.opacity = String(1 - p);
      heroTexto.style.transform = 'translateY(' + Math.round(p * 46) + 'px)';
    }
  }
  window.addEventListener('scroll', alScroll, { passive: true });

  // Títulos de las secciones de siempre también entran palabra por palabra
  document.querySelectorAll('#precios h2, #estudio h2, #instagram h2, #faq h2, #ubicacion h2').forEach(function(el){
    el.classList.add('rv', 'rv-words');
  });
  document.querySelectorAll('#precios h3, #estudio h3, #precios .cupon, #faq details, #ubicacion .grid > div, #instagram #historias, #instagram #reelsIG').forEach(function(el){
    el.classList.add('rv');
  });

  // Palabra por palabra: cada palabra entra con un pequeño retraso
  window.apPartirPalabras = function(el){
    var palabras = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    palabras.forEach(function(p, i){
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = p;
      s.style.transitionDelay = (i * 45) + 'ms';
      el.appendChild(s);
      el.appendChild(document.createTextNode(' '));
    });
  };
  document.querySelectorAll('.rv-words').forEach(function(el){ if(!el.querySelector('.w')) window.apPartirPalabras(el); });

  // Aparece al entrar en pantalla y desaparece al salir
  var todos = document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){ e.target.classList.toggle('on', e.isIntersecting); });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    todos.forEach(function(el){ io.observe(el); });
  } else {
    todos.forEach(function(el){ el.classList.add('on'); });
  }

  // Videos: siempre en silencio y solo se reproducen cuando se ven (ahorra batería y datos)
  var videos = document.querySelectorAll('video[data-video]');
  function reproducir(v){ v.muted = true; v.volume = 0; var p = v.play(); if(p && p.catch) p.catch(function(){}); }
  videos.forEach(function(v){ v.muted = true; v.volume = 0; v.defaultMuted = true; });
  if('IntersectionObserver' in window && videos.length){
    var iov = new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){ if(e.isIntersecting) reproducir(e.target); else e.target.pause(); });
    }, { threshold: 0.1 });
    videos.forEach(function(v){ iov.observe(v); });
  } else {
    videos.forEach(reproducir);
  }

  // «Cómo funciona»: los pasos se encienden uno a uno mientras la banda está en pantalla
  var tl = document.getElementById('apTimeline');
  if(tl && !reducir){
    var pasos = tl.querySelectorAll('li'), k = 0, reloj = null;
    function siguientePaso(){ k = (k + 1) % pasos.length; pasos.forEach(function(li, i){ li.classList.toggle('activa', i === k); }); }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        es.forEach(function(e){ if(e.isIntersecting){ if(!reloj) reloj = setInterval(siguientePaso, 2200); } else if(reloj){ clearInterval(reloj); reloj = null; } });
      }, { threshold: 0.3 }).observe(tl);
    } else { reloj = setInterval(siguientePaso, 2200); }
  }

  // Al cargar (y si cambia el #hash, por ejemplo con el botón atrás): respetar #precios, #estudio, #reservar, #instagram…
  function porHash(){
    var h = (location.hash || '').replace('#', '');
    if(h === 'reservar' || h === 'reserva'){ verVista('inicio'); setTimeout(abrirReserva, 400); }
    else if(ALIAS[h] && VISTAS.indexOf(h) < 0){ verVista(ALIAS[h]); setTimeout(function(){ irA(h); }, 250); }
    else { verVista(h || 'inicio'); }
  }
  var _ultimoHash = null;
  window.addEventListener('hashchange', function(){
    var h = (location.hash || '').replace('#', '');
    if(h !== _ultimoHash){ _ultimoHash = h; porHash(); }
  });
  _ultimoHash = (location.hash || '').replace('#', '');
  porHash();
})();
