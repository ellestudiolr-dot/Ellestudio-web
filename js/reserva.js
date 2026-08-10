// elle studio · página pública (diseño v3)
// Conexión a Supabase (llave pública anon — protegida por RLS: el público SOLO puede crear reservas)
var CONFIG = {
  SUPABASE_URL: 'https://bwgiktpsmrvfaoyoftwy.supabase.co',
  SUPABASE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Z2lrdHBzbXJ2ZmFveW9mdHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzY2NjUsImV4cCI6MjA4NzU1MjY2NX0.-3YsxigCNWDeZnW8uLSro6UXsHhRNLmcJHEap0fnHz0',
  WHATSAPP: '51983790638',      // WhatsApp del estudio (+51 983 790 638)
  INSTAGRAM: '_elleestudio',    // usuario de Instagram sin @
  TIKTOK: ''                    // usuario de TikTok sin @ — al ponerlo aparece el icono en el pie
};

// Botones de WhatsApp: aparecen solo si hay número configurado
(function(){
  if(CONFIG.WHATSAPP){
    var msg = encodeURIComponent('Hola, quiero información sobre sus servicios');
    var url = 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + msg;
    ['waHero','waUbicacion','waFooter'].forEach(function(id){
      var el = document.getElementById(id);
      if(el){ el.href = url; el.hidden = false; }
    });
  }
  if(CONFIG.TIKTOK){
    var tk = document.getElementById('tkFooter');
    if(tk){ tk.href = 'https://www.tiktok.com/@' + CONFIG.TIKTOK; tk.hidden = false; }
  }
  // La fecha del formulario no puede ser pasada
  var f = document.getElementById('fecha');
  if(f){
    var hoy = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
    f.min = hoy;
  }
  // Si llega desde otra página con ?svc= (ej. el asistente en precios.html), preseleccionar el servicio
  try{
    var svcParam = new URLSearchParams(location.search).get('svc');
    var sel = document.getElementById('servicio');
    if(svcParam && sel){
      var mapa = { 'Tratamientos Corporales': 'Body Porcelana' };
      sel.value = mapa[svcParam] || svcParam;
      if(!sel.value) sel.value = 'Otro / no estoy segura';
    }
  }catch(e){}
})();

// Envío de la reserva → tabla web_reservas (Supabase)
(function(){
  var form = document.getElementById('formReserva');
  if(!form) return;
  var enviando = false;

  form.addEventListener('submit', async function(ev){
    ev.preventDefault();
    if(enviando) return;

    var estado = document.getElementById('estadoReserva');
    var boton  = document.getElementById('btnEnviar');
    var nombre = document.getElementById('nombre').value.trim();
    var tel    = document.getElementById('celular').value.replace(/\D/g,'');
    var svc    = document.getElementById('servicio').value;

    estado.style.color = '#b0503c';
    if(nombre.length < 2){ estado.textContent = 'Escribe tu nombre.'; return; }
    if(tel.length < 9){ estado.textContent = 'Escribe un celular válido (9 dígitos).'; return; }
    if(!svc){ estado.textContent = 'Selecciona un servicio.'; return; }

    var datos = {
      nombre: nombre,
      telefono: tel,
      servicio: svc,
      fecha_preferida: document.getElementById('fecha').value || null,
      hora_preferida: document.getElementById('horario').value || null,
      mensaje: document.getElementById('mensaje').value.trim() || null
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
      estado.style.color = '#4d6b3c';
      estado.textContent = 'Listo, recibimos tu reserva. Te confirmamos por WhatsApp.';
      boton.textContent = 'Reserva enviada';
    }catch(e){
      estado.textContent = 'No se pudo enviar. Intenta de nuevo en un momento.';
      boton.disabled = false;
      boton.textContent = 'Enviar reserva';
      enviando = false;
    }
  });
})();
