// elle studio · Todo lo que se pide en la página se convierte en un mensaje de WhatsApp
// El número se configura en js/reserva.js (CONFIG.WHATSAPP) o desde el editor (contenido.json → whatsapp).
(function(){

  function numero(){
    // 1) el que se haya guardado desde el editor  2) el de CONFIG
    var n = (window._WA_NUM || '') || (typeof CONFIG !== 'undefined' ? (CONFIG.WHATSAPP || '') : '');
    return String(n).replace(/\D/g, '');
  }
  window.hayWhatsApp = function(){ return !!numero(); };

  // Abre la app de WhatsApp con el número del estudio y el texto ya escrito
  window.abrirWa = function(texto){
    if(window._MODO_EDITOR){ return true; }   // en el editor no se abre WhatsApp
    var n = numero();
    if(!n){ return false; }
    var url = 'https://wa.me/' + n + '?text=' + encodeURIComponent(texto);
    window._ULTIMO_WA = url;
    var esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent || '');
    if(esMovil){
      // En celular: va directo a la app de WhatsApp (no lo bloquea el navegador)
      window.location.href = url;
    } else {
      // En computadora: nueva pestaña con WhatsApp Web / la app de escritorio
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    return true;
  };

  // Pedido rápido desde cualquier botón (tarjeta de precio, oferta, tratamiento…)
  window.pedirWa = function(quePide){
    var texto = 'Hola elle studio \uD83C\uDF38\n\nVengo de la página web y quiero información para agendar:\n'
              + '• ' + (quePide || 'un tratamiento') + '\n\n¿Me confirman disponibilidad y precio, por favor?';
    if(!abrirWa(texto)){
      // Sin número configurado: abre el formulario para no perder a la clienta
      if(typeof window.abrirReserva === 'function'){
        window.abrirReserva();
        var sel = document.getElementById('servicio');
        if(sel && quePide){
          var opciones = [].slice.call(sel.options).map(function(o){ return o.value; });
          var coincide = opciones.find(function(o){ return o && quePide.toLowerCase().indexOf(o.toLowerCase().split(' ')[0]) >= 0; });
          sel.value = coincide || 'Otro / no estoy segura';
        }
      }
    }
  };

  // Envía la solicitud del popup por WhatsApp (y la deja registrada en la base)
  window.enviarSolicitud = function(){
    var nombre  = (document.getElementById('nombre')   || {}).value || '';
    var tel     = (document.getElementById('celular')  || {}).value || '';
    var svc     = (document.getElementById('servicio') || {}).value || '';
    var fecha   = (document.getElementById('fecha')    || {}).value || '';
    var horario = (document.getElementById('horario')  || {}).value || '';
    var msj     = (document.getElementById('mensaje')  || {}).value || '';
    var estado  = document.getElementById('estadoReserva');

    nombre = nombre.trim();
    var telLimpio = tel.replace(/\D/g, '');
    if(estado){ estado.style.color = '#b0503c'; }
    // Solo el tratamiento es obligatorio: el resto se sabe por WhatsApp
    if(!svc){ if(estado) estado.textContent = 'Elige el tratamiento que te interesa.'; return; }

    // Fecha en formato bonito
    var fechaTxt = '';
    if(fecha){
      var d = new Date(fecha + 'T12:00:00');
      var dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
      var meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      fechaTxt = dias[d.getDay()] + ' ' + d.getDate() + ' de ' + meses[d.getMonth()];
    }

    var texto = 'Hola elle studio \uD83C\uDF38\n\nVengo de la página web y quiero *agendar una cita*:\n\n'
      + '• Tratamiento: ' + svc + '\n'
      + (nombre ? '• Nombre: ' + nombre + '\n' : '')
      + (telLimpio.length >= 9 ? '• Celular: ' + telLimpio + '\n' : '')
      + (fechaTxt ? '• Día que prefiero: ' + fechaTxt + '\n' : '')
      + (horario ? '• Horario: ' + horario + '\n' : '')
      + (msj.trim() ? '• Comentario: ' + msj.trim() + '\n' : '')
      + '\n¿Me confirman el horario disponible, por favor?';

    // Registrar en la base (sin bloquear la apertura de WhatsApp)
    try{
      if(typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON){
        fetch(CONFIG.SUPABASE_URL + '/rest/v1/web_reservas', {
          method: 'POST',
          headers: {
            'apikey': CONFIG.SUPABASE_ANON,
            'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            nombre: (nombre || 'Desde la web'), telefono: (telLimpio.length>=6 ? telLimpio : '000000'), servicio: svc,
            fecha_preferida: fecha || null, hora_preferida: horario || null,
            mensaje: (msj.trim() || null)
          })
        }).catch(function(){});
      }
    }catch(e){}

    if(abrirWa(texto)){
      if(estado){
        estado.style.color = '#4d6b3c';
        estado.innerHTML = 'Te abrimos WhatsApp con tu solicitud lista. Solo tócale enviar.'
          + '<br><a href="' + (window._ULTIMO_WA || '#') + '" target="_blank" rel="noopener" style="color:#7b580e;font-weight:700;text-decoration:underline;">Si no se abrió, toca aquí</a>';
      }
    } else {
      if(estado){ estado.style.color = '#4d6b3c'; estado.textContent = 'Listo, recibimos tu solicitud. Te escribimos por WhatsApp para confirmar.'; }
    }
  };

})();
