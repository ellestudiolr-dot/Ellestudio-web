// elle studio · Visor de historias tipo Instagram (highlights)
// Las colecciones se pueden cambiar desde el editor (contenido.json → historias).
(function(){

  // Cada historia puede ser una publicación REAL de Instagram (reel) o una foto del estudio
  var COLECCIONES = {
    faciales:   { titulo: 'Faciales',    servicio: 'Limpieza Facial',
      fotos: [ {reel:'https://www.instagram.com/reel/DbT6ZPcIut7/', pie:'Limpieza facial · desde S/ 80'},
               {src:'img/facial.jpg', pie:'Piel luminosa e hidratada'} ] },
    gluteos:    { titulo: 'Glúteos',     servicio: 'Glúteos De Porcelana',
      fotos: [ {reel:'https://www.instagram.com/reel/DbeKMQwoJaa/', pie:'Glúteos de Porcelana · desde S/ 89.90'},
               {src:'img/gluteos.jpg', pie:'Levantamiento, firmeza y textura'} ] },
    laser:      { titulo: 'Láser',       servicio: 'Depilación Láser',
      fotos: [ {reel:'https://www.instagram.com/reel/Da1Pk6ZI2mb/', pie:'Depilación láser · desde S/ 25 por zona'},
               {src:'img/equipo-laser.jpg', pie:'Equipo profesional, sesiones rápidas'} ] },
    corporales: { titulo: 'Corporales',  servicio: 'Tratamientos Corporales',
      fotos: [ {reel:'https://www.instagram.com/reel/DatUSDIoP29/', pie:'Equipos reductores · desde S/ 50'},
               {src:'img/corporal.jpg', pie:'Body Porcelana, Sculptbody y Slimbody'} ] },
    estudio:    { titulo: 'El estudio',  servicio: 'una cita en el estudio',
      fotos: [ {reel:'https://www.instagram.com/reel/Dbqa4UWo2S6/', pie:'Así es nuestro estudio en San Isidro'},
               {src:'img/spa-ambiente.jpg', pie:'Av. Paz Soldán 235, San Isidro'} ] }
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
    var lienzo = el('histLienzo');
    if(f.reel){
      var limpio = String(f.reel).trim().replace(/\/$/,'').split('?')[0];
      lienzo.innerHTML = '<div class="reel-hist"><iframe src="' + limpio + '/embed/" allowfullscreen scrolling="no" title="Publicación de elle studio"></iframe></div>';
    } else {
      lienzo.innerHTML = '<img src="' + f.src + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:14px;"/>';
    }
    el('histPie').textContent = f.pie || '';
    el('histTitulo').textContent = col.titulo;
    // Barras de progreso
    el('histBarras').innerHTML = col.fotos.map(function(_, i){
      var relleno = (i < indice) ? '100%' : (i === indice ? '100%' : '0%');
      var esReel = !!col.fotos[indice].reel;
      var anim = (i === indice && !esReel) ? 'transition:width ' + (DURACION/1000) + 's linear;width:100%;' : 'width:' + ((i<=indice)?'100%':'0%') + ';';
      var esActiva = (i === indice);
      var reelActivo = esActiva && !!col.fotos[indice].reel;
      return '<div style="flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.35);overflow:hidden;">'
           + '<div style="height:100%;background:#fff;' + ((esActiva && !reelActivo) ? 'width:0;' : anim) + '" ' + ((esActiva && !reelActivo) ? 'id="barraActiva"' : '') + '></div></div>';
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
    if(!f.reel){ temporizador = setTimeout(histSiguiente, DURACION); }
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
    // Vaciar el lienzo destruye el reproductor: el video se detiene de verdad
    var lienzo = el('histLienzo');
    if(lienzo) lienzo.innerHTML = '';
    var visor = el('visorHist');
    if(visor) visor.style.display = 'none';
    document.body.style.overflow = '';
    actual = null; indice = 0;
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
