// elle studio · Asistente virtual (guiado por botones)
// Responde preguntas por tratamiento y lleva a la clienta a WhatsApp o al formulario de reserva.
// 100% en la página (sin servidores ni claves): sólido, instantáneo y gratis.
(function(){

  // ===== Conocimiento por tratamiento (precios reales de la lista del estudio) =====
  var TRATAMIENTOS = {
    'Depilación Láser': {
      intro: 'Depilación láser para ella y para él, en todas las zonas. Sesiones rápidas y seguras.',
      precio: 'Desde S/ 25 por zona (mini zonas). El precio exacto depende de la zona; hay paquetes de 3 y 6 sesiones que salen mucho más a cuenta.',
      duele: 'La molestia es mínima: usamos tecnología láser moderna y preparamos la piel en cada sesión. La mayoría lo describe como toques de calor muy tolerables.',
      sesiones: 'Depende de la zona y del tipo de vello. Lo usual es empezar con un paquete de 3 o 6 sesiones para ver resultados firmes.'
    },
    'Glúteos De Porcelana': {
      intro: 'Nuestro tratamiento estrella: levantamiento, perfilado y mejora de la textura de la piel de los glúteos.',
      precio: 'Desde S/ 89.90 por sesión. En paquete sale mejor; te cotizamos exacto por WhatsApp.',
      duele: 'No duele: es un tratamiento estético relajante, no invasivo.',
      sesiones: 'Se ven cambios desde las primeras sesiones; el plan ideal se define al evaluarte en tu primera visita.'
    },
    'Limpieza Facial': {
      intro: 'Limpieza facial profunda con hidratación y cuidado del rostro.',
      precio: 'Desde S/ 80 por sesión.',
      duele: 'Para nada: es un tratamiento suave y relajante.',
      sesiones: 'Se recomienda una limpieza cada 4-6 semanas para mantener la piel sana.'
    },
    'Tratamientos Corporales': {
      intro: 'Body Porcelana, Sculptbody y Slimbody: moldean, reafirman y mejoran la piel del cuerpo.',
      precio: 'Desde S/ 50 por sesión, según el tratamiento y la zona.',
      duele: 'No: son tratamientos estéticos no invasivos.',
      sesiones: 'Depende del objetivo; al evaluarte te armamos el plan con la cantidad ideal.'
    }
  };

  // ===== Estilos del widget =====
  var css = ''
    + '#elleChatFab{position:fixed;bottom:26px;right:26px;z-index:9998;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;'
    + 'background:linear-gradient(135deg,#B99043,#D8BC7E);box-shadow:0 6px 24px rgba(185,144,67,.45);display:flex;align-items:center;justify-content:center;transition:transform .15s;}'
    + '#elleChatFab:hover{transform:scale(1.06);}'
    + '#elleChatFab svg{width:26px;height:26px;stroke:#1c1f18;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}'
    + '#elleChatPanel{position:fixed;bottom:100px;right:26px;z-index:9999;width:min(360px,calc(100vw - 32px));max-height:min(540px,calc(100vh - 130px));'
    + 'background:#fffdf8;border:1px solid #d9dbd2;border-radius:18px;box-shadow:0 18px 50px rgba(25,28,23,.22);display:none;flex-direction:column;overflow:hidden;font-family:\'DM Sans\',sans-serif;}'
    + '#elleChatPanel.abierto{display:flex;}'
    + '#elleChatHead{background:#1c1f18;color:#f6f1e7;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;}'
    + '#elleChatHead .t{font-family:\'EB Garamond\',serif;font-style:italic;font-size:1.15rem;}'
    + '#elleChatHead .s{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:#D8BC7E;display:block;font-family:\'DM Sans\',sans-serif;font-style:normal;}'
    + '#elleChatCerrar{background:none;border:none;color:#cfc9b8;font-size:1.2rem;cursor:pointer;line-height:1;padding:4px;}'
    + '#elleChatMsgs{padding:16px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:10px;background:#f6f1e7;}'
    + '.elleMsgBot{background:#fffdf8;border:1px solid #e1e3db;border-radius:14px 14px 14px 4px;padding:10px 14px;font-size:.88rem;color:#2a2d24;max-width:92%;align-self:flex-start;line-height:1.45;}'
    + '.elleMsgUser{background:linear-gradient(135deg,#B99043,#D8BC7E);color:#1c1f18;border-radius:14px 14px 4px 14px;padding:9px 14px;font-size:.88rem;font-weight:600;max-width:85%;align-self:flex-end;}'
    + '#elleChatOpc{padding:12px 14px;border-top:1px solid #e1e3db;background:#fffdf8;display:flex;flex-wrap:wrap;gap:8px;}'
    + '.elleOpc{border:1.2px solid #B99043;color:#7b580e;background:transparent;border-radius:999px;padding:8px 14px;font-size:.78rem;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif;transition:background .12s;}'
    + '.elleOpc:hover{background:rgba(185,144,67,.1);}'
    + '.elleOpc.principal{background:linear-gradient(135deg,#B99043,#D8BC7E);color:#1c1f18;border:none;}'
    + '@media (max-width:640px){#elleChatFab{bottom:18px;right:18px;}#elleChatPanel{bottom:88px;right:16px;}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ===== Estructura =====
  var fab = document.createElement('button');
  fab.id = 'elleChatFab';
  fab.setAttribute('aria-label', 'Abrir asistente de elle studio');
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  document.body.appendChild(fab);

  var panel = document.createElement('div');
  panel.id = 'elleChatPanel';
  panel.innerHTML = ''
    + '<div id="elleChatHead"><div><span class="t">elle studio</span><span class="s">Asistente virtual</span></div>'
    + '<button id="elleChatCerrar" aria-label="Cerrar">×</button></div>'
    + '<div id="elleChatMsgs"></div>'
    + '<div id="elleChatOpc"></div>';
  document.body.appendChild(panel);

  var msgs = panel.querySelector('#elleChatMsgs');
  var opciones = panel.querySelector('#elleChatOpc');
  var tratamientoActual = null;
  var saludado = false;

  function bot(texto){
    var d = document.createElement('div');
    d.className = 'elleMsgBot';
    d.textContent = texto;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function user(texto){
    var d = document.createElement('div');
    d.className = 'elleMsgUser';
    d.textContent = texto;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function setOpciones(lista){
    opciones.innerHTML = '';
    lista.forEach(function(o){
      var b = document.createElement('button');
      b.className = 'elleOpc' + (o.principal ? ' principal' : '');
      b.textContent = o.txt;
      b.onclick = o.fn;
      opciones.appendChild(b);
    });
  }

  // ===== Flujos =====
  function menuTratamientos(){
    setOpciones(Object.keys(TRATAMIENTOS).map(function(nombre){
      return { txt: nombre, fn: function(){ elegirTratamiento(nombre); } };
    }).concat([{ txt: 'Otra consulta', fn: otraConsulta }]));
  }

  function elegirTratamiento(nombre){
    tratamientoActual = nombre;
    user(nombre);
    bot(TRATAMIENTOS[nombre].intro);
    setTimeout(function(){ bot('¿Qué te gustaría saber?'); menuPreguntas(); }, 250);
  }

  function menuPreguntas(){
    setOpciones([
      { txt: 'Precios', fn: function(){ responder('precio', 'Precios'); } },
      { txt: '¿Duele?', fn: function(){ responder('duele', '¿Duele?'); } },
      { txt: '¿Cuántas sesiones?', fn: function(){ responder('sesiones', '¿Cuántas sesiones?'); } },
      { txt: 'Reservar cita', principal: true, fn: irAReservar },
      { txt: 'WhatsApp', fn: irAWhatsApp },
      { txt: 'Otro tratamiento', fn: function(){ user('Otro tratamiento'); bot('Claro, ¿cuál te interesa?'); menuTratamientos(); } }
    ]);
  }

  function responder(clave, etiqueta){
    user(etiqueta);
    bot(TRATAMIENTOS[tratamientoActual][clave]);
    setTimeout(menuPreguntas, 200);
  }

  function otraConsulta(){
    user('Otra consulta');
    bot('Estamos en Av. Paz Soldán 235, San Isidro, Lima. Atendemos con cita previa: déjala en la página y te confirmamos por WhatsApp.');
    setOpciones([
      { txt: 'Reservar cita', principal: true, fn: irAReservar },
      { txt: 'WhatsApp', fn: irAWhatsApp },
      { txt: 'Ver tratamientos', fn: function(){ user('Ver tratamientos'); bot('¿Cuál te interesa?'); menuTratamientos(); } }
    ]);
  }

  function irAReservar(){
    user('Reservar cita');
    // Preseleccionar el servicio en el formulario
    var sel = document.getElementById('servicio');
    if(sel && tratamientoActual){
      var mapa = { 'Tratamientos Corporales': 'Body Porcelana' };
      sel.value = mapa[tratamientoActual] || tratamientoActual;
      if(!sel.value) sel.value = 'Otro / no estoy segura';
    }
    bot('Te llevo al formulario. Déjanos tus datos y te confirmamos por WhatsApp.');
    setTimeout(function(){
      cerrar();
      var r = document.getElementById('reserva');
      if(r){ r.scrollIntoView({ behavior: 'smooth' }); }
      else {
        // Desde otra página (ej. precios.html) → ir al formulario de la principal con el servicio elegido
        var svc = tratamientoActual ? ('?svc=' + encodeURIComponent(tratamientoActual)) : '';
        window.location.href = 'index.html' + svc + '#reserva';
      }
    }, 700);
  }

  function irAWhatsApp(){
    user('WhatsApp');
    if(typeof CONFIG !== 'undefined' && CONFIG.WHATSAPP){
      var texto = 'Hola, me interesa ' + (tratamientoActual || 'información de sus tratamientos') + '. ¿Me pueden dar más información?';
      bot('Te abro nuestro WhatsApp, escríbenos y te respondemos al toque.');
      window.open('https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
      setTimeout(menuPreguntas, 300);
    } else {
      bot('Por ahora atendemos las reservas desde esta página: déjanos tus datos y NOSOTRAS te escribimos por WhatsApp para confirmar.');
      setOpciones([
        { txt: 'Reservar cita', principal: true, fn: irAReservar },
        { txt: 'Ver tratamientos', fn: function(){ user('Ver tratamientos'); bot('¿Cuál te interesa?'); menuTratamientos(); } }
      ]);
    }
  }

  function abrir(){
    panel.classList.add('abierto');
    if(!saludado){
      saludado = true;
      bot('Hola, soy la asistente de elle studio. Te ayudo con precios, dudas y tu reserva.');
      setTimeout(function(){ bot('¿Qué tratamiento te interesa?'); menuTratamientos(); }, 300);
    }
  }
  function cerrar(){ panel.classList.remove('abierto'); }

  fab.addEventListener('click', function(){
    if(panel.classList.contains('abierto')) cerrar(); else abrir();
  });
  panel.querySelector('#elleChatCerrar').addEventListener('click', cerrar);

})();
