// elle studio · página pública
// Conexión a Supabase (llave pública anon — protegida por RLS: el público SOLO puede crear reservas)
var CONFIG = {
  SUPABASE_URL: 'https://bwgiktpsmrvfaoyoftwy.supabase.co',
  SUPABASE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Z2lrdHBzbXJ2ZmFveW9mdHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzY2NjUsImV4cCI6MjA4NzU1MjY2NX0.-3YsxigCNWDeZnW8uLSro6UXsHhRNLmcJHEap0fnHz0',
  WHATSAPP: '',   // número del estudio con código de país, ej: '51987654321' — al ponerlo aparecen los botones
  INSTAGRAM: ''   // usuario de Instagram sin @, ej: 'ellestudio.pe' — al ponerlo aparece el botón
};

// Mostrar botones de WhatsApp / Instagram solo si están configurados
(function(){
  if(CONFIG.WHATSAPP){
    var msg = encodeURIComponent('Hola, quiero información sobre sus servicios');
    var url = 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + msg;
    ['btnWhatsHero','btnWhatsPie'].forEach(function(id){
      var el = document.getElementById(id);
      if(el){ el.href = url; el.hidden = false; }
    });
  }
  if(CONFIG.INSTAGRAM){
    var el = document.getElementById('btnInstaPie');
    if(el){ el.href = 'https://instagram.com/' + CONFIG.INSTAGRAM; el.hidden = false; }
  }
  // La fecha del formulario no puede ser pasada
  var f = document.getElementById('rFecha');
  if(f){
    var hoy = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
    f.min = hoy;
  }
})();

// Envío de la reserva → tabla web_reservas (Supabase)
(function(){
  var form = document.getElementById('formReserva');
  if(!form) return;
  var enviando = false;

  form.addEventListener('submit', async function(ev){
    ev.preventDefault();
    if(enviando) return;

    var estado = document.getElementById('rEstado');
    var boton  = document.getElementById('rEnviar');
    var nombre = document.getElementById('rNombre').value.trim();
    var tel    = document.getElementById('rTelefono').value.replace(/\D/g,'');

    estado.className = 'form-estado';
    if(nombre.length < 2){ estado.textContent = 'Escribe tu nombre.'; estado.classList.add('error'); return; }
    if(tel.length < 9){ estado.textContent = 'Escribe un celular válido (9 dígitos).'; estado.classList.add('error'); return; }

    var datos = {
      nombre: nombre,
      telefono: tel,
      servicio: document.getElementById('rServicio').value,
      fecha_preferida: document.getElementById('rFecha').value || null,
      hora_preferida: document.getElementById('rHora').value || null,
      mensaje: document.getElementById('rMensaje').value.trim() || null
    };

    enviando = true;
    boton.disabled = true;
    boton.textContent = 'Enviando...';
    estado.textContent = '';

    try{
      var r = await fetch(CONFIG.SUPABASE_URL + '/rest/v1/web_reservas', {
        method: 'POST',
        headers: {
          'apikey': CONFIG.SUPABASE_ANON,
          'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(datos)
      });
      if(!r.ok) throw new Error('HTTP ' + r.status);
      form.reset();
      estado.textContent = 'Listo, recibimos tu reserva. Te confirmamos por WhatsApp.';
      estado.classList.add('ok');
      boton.textContent = 'Reserva enviada';
    }catch(e){
      estado.textContent = 'No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.';
      estado.classList.add('error');
      boton.disabled = false;
      boton.textContent = 'Enviar reserva';
      enviando = false;
    }
  });
})();
