// elle studio · Visor de historias tipo Instagram (highlights)
// Las colecciones se pueden cambiar desde el editor (contenido.json → historias).
(function(){

  var COLECCIONES = {
    faciales:   { titulo: 'Faciales',    servicio: 'Limpieza Facial',
      fotos: [ {src:'img/facial.jpg', pie:'Limpieza facial profunda · desde S/ 80'},
               {src:'img/equipo-radiofrecuencia.jpg', pie:'Radiofrecuencia para reafirmar la piel'} ] },
    gluteos:    { titulo: 'Glúteos',     servicio: 'Glúteos De Porcelana',
      fotos: [ {src:'img/gluteos.jpg', pie:'Glúteos de Porcelana · desde S/ 89.90'},
               {src:'img/equipo-lipolaser.jpg', pie:'Trabajamos con lipoláser y enzimas'} ] },
    laser:      { titulo: 'Láser',       servicio: 'Depilación Láser',
      fotos: [ {src:'img/laser-piernas.jpg', pie:'Depilación láser · desde S/ 25 por zona'},
               {src:'img/equipo-laser.jpg', pie:'Equipo profesional, sesiones rápidas'} ] },
    corporales: { titulo: 'Corporales',  servicio: 'Tratamientos Corporales',
      fotos: [ {src:'img/corporal.jpg', pie:'Body Porcelana, Sculptbody y Slimbody'},
               {src:'img/equipo-cavitacion.jpg', pie:'Ultracavitación para moldear la silueta'} ] },
    estudio:    { titulo: 'El estudio',  servicio: 'una cita en el estudio',
      fotos: [ {src:'img/spa-ambiente.jpg', pie:'Av. Paz Soldán 235, San Isidro'},
               {src:'img/hero-modelo.jpg', pie:'Atención personalizada, solo con cita'} ] }
  };

  var actual = null, indice = 0, temporizador = null;
  var DURACION = 4200;

  function el(id){ return document.getElementById(id); }

  function pintar(){
    var col = COLECCIONES[actual];
    if(!col || !col.fotos.length) return;
    if(indice >= col.fotos.length) indice = 0;
    if(indice < 0) indice = 0;
    var f = col.fotos[indice];
    el('histImg').src = f.src;
    el('histPie').textContent = f.pie || '';
    el('histTitulo').textContent = col.titulo;
    // Barras de progreso
    el('histBarras').innerHTML = col.fotos.map(function(_, i){
      var relleno = (i < indice) ? '100%' : (i === indice ? '100%' : '0%');
      var anim = (i === indice) ? 'transition:width ' + (DURACION/1000) + 's linear;width:100%;' : 'width:' + relleno + ';';
      return '<div style="flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.35);overflow:hidden;">'
           + '<div style="height:100%;background:#fff;' + (i===indice ? 'width:0;' : anim) + '" ' + (i===indice ? 'id="barraActiva"' : '') + '></div></div>';
    }).join('');
    // Arrancar la animación de la barra activa
    var barra = el('barraActiva');
    if(barra){
      requestAnimationFrame(function(){
        barra.style.transition = 'width ' + (DURACION/1000) + 's linear';
        barra.style.width = '100%';
      });
    }
    clearTimeout(temporizador);
    temporizador = setTimeout(histSiguiente, DURACION);
  }

  window.verHistoria = function(clave){
    if(!COLECCIONES[clave]) return;
    actual = clave; indice = 0;
    el('visorHist').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    pintar();
  };
  window.cerrarHistoria = function(){
    clearTimeout(temporizador);
    el('visorHist').style.display = 'none';
    document.body.style.overflow = '';
  };
  window.histSiguiente = function(){
    var col = COLECCIONES[actual];
    if(!col) return;
    if(indice + 1 < col.fotos.length){ indice++; pintar(); }
    else { cerrarHistoria(); }
  };
  window.histAnterior = function(){
    if(indice > 0){ indice--; pintar(); }
  };
  window.histServicio = function(){
    var col = COLECCIONES[actual];
    return col ? col.servicio : 'un tratamiento';
  };

  document.addEventListener('keydown', function(e){
    if(el('visorHist') && el('visorHist').style.display === 'flex'){
      if(e.key === 'Escape') cerrarHistoria();
      if(e.key === 'ArrowRight') histSiguiente();
      if(e.key === 'ArrowLeft') histAnterior();
    }
  });

  // Permitir que el editor reemplace las colecciones
  window._setHistorias = function(nuevas){
    if(nuevas && typeof nuevas === 'object'){
      Object.keys(nuevas).forEach(function(k){
        if(COLECCIONES[k] && nuevas[k] && nuevas[k].length){
          COLECCIONES[k].fotos = nuevas[k].map(function(f){
            return (typeof f === 'string') ? {src:f, pie:''} : {src:f.src, pie:f.pie||''};
          });
        }
      });
    }
  };
})();
