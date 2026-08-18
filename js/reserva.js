// elle studio · página pública (diseño v3)
// Conexión a Supabase (llave pública anon — protegida por RLS: el público SOLO puede crear reservas)
var CONFIG = {
  SUPABASE_URL: 'https://bwgiktpsmrvfaoyoftwy.supabase.co',
  SUPABASE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Z2lrdHBzbXJ2ZmFveW9mdHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzY2NjUsImV4cCI6MjA4NzU1MjY2NX0.-3YsxigCNWDeZnW8uLSro6UXsHhRNLmcJHEap0fnHz0',
  WHATSAPP: '51983790638',      // WhatsApp del estudio (+51 983 790 638)
  INSTAGRAM: '_elleestudio',    // usuario de Instagram sin @
  TIKTOK: '',                   // usuario de TikTok sin @ — al ponerlo aparece el icono en el pie
  BEHOLD_FEED: ''               // enlace del feed de Behold — al ponerlo, los videos de Instagram se actualizan solos
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

// El envío del formulario lo maneja js/whatsapp.js (enviarSolicitud):
// arma el mensaje, abre WhatsApp y registra la solicitud en web_reservas.
