// elle studio · Sección "El Estudio": tarjetas de equipos interactivas + contadores animados
(function(){

  var EQUIPOS = [
    { clave:'equipo_laser', foto:'img/equipo-laser.jpg', titulo:'Láser de Depilación',
      resumen:'Sesiones rápidas y prácticamente sin dolor, para ella y para él.',
      trata:['Todas las zonas del cuerpo','Piel sensible con parámetros ajustados','Vello fino y grueso'],
      servicio:'Depilación Láser' },
    { clave:'equipo_cavitacion', foto:'img/equipo-cavitacion.jpg', titulo:'Ultracavitación',
      resumen:'Ultrasonido que ayuda a reducir medidas y moldear la silueta.',
      trata:['Grasa localizada','Abdomen, flancos y piernas','Combina con enzimas'],
      servicio:'Sculptbody / Slimbody' },
    { clave:'equipo_radio', foto:'img/equipo-radiofrecuencia.jpg', titulo:'Radiofrecuencia',
      resumen:'Calor controlado que reafirma la piel y estimula el colágeno.',
      trata:['Flacidez y firmeza','Textura de la piel','Rostro y cuerpo'],
      servicio:'Radiofrecuencia' },
    { clave:'equipo_lipolaser', foto:'img/equipo-lipolaser.jpg', titulo:'Lipoláser',
      resumen:'Láser de baja intensidad para trabajar la grasa localizada.',
      trata:['Contorno corporal','Se combina con carboxiterapia','Sesiones cómodas'],
      servicio:'Lipoláser' }
  ];

  function pintarEquipos(){
    var cont = document.getElementById('equipos');
    if(!cont) return;
    cont.innerHTML = EQUIPOS.map(function(e, i){
      return '<div class="equipo" onclick="verEquipo(' + i + ')" id="eq-' + i + '">'
        + '<div class="foto"><img src="' + e.foto + '" alt="' + e.titulo + '" loading="lazy" data-edit-img="' + e.clave + '"/></div>'
        + '<div class="p-6">'
          + '<h3 class="font-headline-sm text-headline-sm mb-2">' + e.titulo + '</h3>'
          + '<p class="font-body-md text-body-md text-on-surface-variant">' + e.resumen + '</p>'
          + '<div class="detalle">'
            + '<ul style="margin:14px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">'
              + e.trata.map(function(t){
                  return '<li style="display:flex;gap:8px;align-items:flex-start;" class="font-body-md text-body-md text-on-surface-variant">'
                       + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B99043" stroke-width="2.6" stroke-linecap="round" style="margin-top:3px;flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>'
                       + '<span>' + t + '</span></li>';
                }).join('')
            + '</ul>'
            + '<button onclick="event.stopPropagation();pedirWa(\'' + e.servicio.replace(/'/g,'') + '\')" class="gold-gradient-bg text-on-background font-label-upper text-label-upper px-5 py-3 rounded-full uppercase w-full" style="border:none;cursor:pointer;margin-top:16px;">Pedir por WhatsApp</button>'
          + '</div>'
          + '<div class="mas mt-4" id="mas-' + i + '">Ver qué trata +</div>'
        + '</div></div>';
    }).join('');
  }

  window.verEquipo = function(i){
    var tarjeta = document.getElementById('eq-' + i);
    if(!tarjeta) return;
    var abierta = tarjeta.classList.contains('abierto');
    // Cerrar las demás para que se lea limpio
    EQUIPOS.forEach(function(_, j){
      var t = document.getElementById('eq-' + j);
      var m = document.getElementById('mas-' + j);
      if(t) t.classList.remove('abierto');
      if(m) m.textContent = 'Ver qué trata +';
    });
    if(!abierta){
      tarjeta.classList.add('abierto');
      var m = document.getElementById('mas-' + i);
      if(m) m.textContent = 'Cerrar −';
    }
  };

  // Contadores que suben al entrar en pantalla
  function animarContador(el){
    var hasta = parseInt(el.getAttribute('data-hasta') || '0', 10);
    var pre = el.getAttribute('data-pre') || '';
    var inicio = null, dur = 1100;
    function paso(t){
      if(!inicio) inicio = t;
      var p = Math.min((t - inicio) / dur, 1);
      var val = Math.floor(hasta * (1 - Math.pow(1 - p, 3)));
      el.textContent = pre + val.toLocaleString('es-PE');
      if(p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  function observarContadores(){
    var els = document.querySelectorAll('.contador');
    if(!els.length) return;
    if(!('IntersectionObserver' in window)){ els.forEach(animarContador); return; }
    var obs = new IntersectionObserver(function(entradas){
      entradas.forEach(function(en){
        if(en.isIntersecting && !en.target._listo){
          en.target._listo = true;
          animarContador(en.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(function(e){ obs.observe(e); });
  }

  pintarEquipos();
  observarContadores();
})();
