// elle studio · Navegación por vistas + popup de reserva
(function(){
  var VISTAS = ['inicio','servicios','como','instagram','ubicacion'];

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

  window.abrirReserva = function(){
    var m = document.getElementById('modalReserva');
    if(m){ m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  };
  window.cerrarReserva = function(){
    var m = document.getElementById('modalReserva');
    if(m){ m.style.display = 'none'; document.body.style.overflow = ''; }
  };

  // Clic en el fondo oscuro cierra el popup
  document.addEventListener('click', function(e){
    var m = document.getElementById('modalReserva');
    if(m && e.target === m) cerrarReserva();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') cerrarReserva(); });

  // Los enlaces del menú cambian de vista (sin recargar)
  document.querySelectorAll('[data-nav]').forEach(function(a){
    a.addEventListener('click', function(ev){
      ev.preventDefault();
      verVista(a.getAttribute('data-nav'));
    });
  });

  // Al cargar: respetar el hash (#servicios, #ubicacion, #reservar...)
  var h = (location.hash || '').replace('#','');
  if(h === 'reservar' || h === 'reserva'){
    verVista('inicio');
    setTimeout(abrirReserva, 400);
  } else if(h === 'como-funciona'){
    verVista('como');
  } else {
    verVista(h || 'inicio');
  }
})();
