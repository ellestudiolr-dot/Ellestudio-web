// elle studio · Navegación por vistas + popup de reserva
(function(){
  var VISTAS = ['inicio','servicios','como','ubicacion'];

  window.verVista = function(v){
    if(VISTAS.indexOf(v) < 0) v = 'inicio';
    document.querySelectorAll('.vista').forEach(function(s){
      s.classList.toggle('activa', s.getAttribute('data-vista') === v);
    });
    document.querySelectorAll('[data-nav]').forEach(function(a){
      a.classList.toggle('nav-activa', a.getAttribute('data-nav') === v);
    });
    window.scrollTo(0, 0);
    try{ history.replaceState(null, '', '#' + v); }catch(e){}
  };

  // Para los onclick del menú (fallback robusto, no depende de listeners)
  window._nav = function(v){ verVista(v); return false; };
  window._navSvc = function(idCard){
    verVista('servicios');
    setTimeout(function(){
      var el = document.getElementById(idCard);
      if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    return false;
  };

  window.abrirReserva = function(){
    var m = document.getElementById('modalReserva');
    if(m){ m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  };
  window.cerrarReserva = function(){
    var m = document.getElementById('modalReserva');
    if(m){ m.style.display = 'none'; document.body.style.overflow = ''; }
  };

  // Chips del popup: eligen el servicio del formulario
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
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') cerrarReserva(); });

  document.querySelectorAll('[data-nav]').forEach(function(a){
    a.addEventListener('click', function(ev){
      ev.preventDefault();
      verVista(a.getAttribute('data-nav'));
    });
  });

  // Al cargar: respetar el hash
  var h = (location.hash || '').replace('#','');
  if(h === 'reservar' || h === 'reserva'){
    verVista('inicio');
    setTimeout(abrirReserva, 400);
  } else if(h === 'como-funciona'){
    verVista('como');
  } else if(h === 'instagram'){
    verVista('inicio');
    setTimeout(function(){
      var el = document.getElementById('instagram');
      if(el) el.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  } else {
    verVista(h || 'inicio');
  }
})();
