// elle studio · «Mi cuenta» (portal de clientas)
// La clienta crea su cuenta con correo y contraseña y ve SOLO información: tratamientos,
// sesiones, próxima cita y descuentos. Sin fotos. Todo pasa por las funciones portal_* de
// Supabase (no usa el inicio de sesión del CRM). El estudio une cada cuenta con su ficha desde el CRM.
(function(){
  var caja = document.getElementById('cuentaApp');
  if(!caja) return;
  var CLAVE = 'elle_cuenta';
  var token = null, datos = null, modo = 'entrar', aviso = null, verTodo = false, codigoEnviado = false, correoForm = '';
  try{ token = localStorage.getItem(CLAVE); }catch(e){}

  function cfg(){ return window.CONFIG || {}; }
  function rpc(fn, args){
    var c = cfg();
    return fetch(c.SUPABASE_URL + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: c.SUPABASE_ANON, Authorization: 'Bearer ' + c.SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify(args || {})
    }).then(function(r){ return r.json().then(function(d){ if(!r.ok) throw d; return d; }); });
  }
  function guardarToken(t){
    token = t || null;
    try{ if(token) localStorage.setItem(CLAVE, token); else localStorage.removeItem(CLAVE); }catch(e){}
    marcarBoton();
  }
  function marcarBoton(){
    document.querySelectorAll('.ap-cuenta-btn').forEach(function(b){ b.classList.toggle('con-sesion', !!token); });
  }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(ch){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]; }); }
  function aFecha(iso){ var p = String(iso || '').slice(0, 10).split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }
  function fecha(iso, conDia){
    var d = aFecha(iso); if(!d) return '';
    try{ return d.toLocaleDateString('es-PE', conDia ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch(e){ return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(); }
  }
  function hoy(){ var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function primerNombre(n){ return String(n || '').trim().split(/\s+/)[0] || ''; }
  function waEnlace(txt){ var n = String(cfg().WHATSAPP || '').replace(/\D/g, ''); return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(txt) : '#'; }

  var ICO = {
    trat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#191c17" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.6-.8z"/></svg>',
    ses: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#191c17" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
    cita: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#191c17" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    desc: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#191c17" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>'
  };

  function htmlAviso(){
    if(!aviso) return '';
    return '<div class="cu-aviso' + (aviso.tipo === 'error' ? ' error' : '') + '" role="alert">' + esc(aviso.txt)
      + (aviso.wa ? '<a class="cu-btn cu-btn-chico" href="' + waEnlace(aviso.wa) + '" target="_blank" rel="noopener">Escribir por WhatsApp</a>' : '') + '</div>';
  }

  // ---------- entrar / crear cuenta / olvidé mi contraseña ----------
  function htmlAcceso(){
    var f = '';
    if(modo === 'crear'){
      f = '<form id="cuFormCrear" novalidate>'
        + '<label class="cu-campo"><span>Nombre y apellido</span><input id="cuNombre" type="text" autocomplete="name" maxlength="80" required></label>'
        + '<label class="cu-campo"><span>Celular</span><input id="cuTel" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" placeholder="9XX XXX XXX" required><small>El mismo que nos diste en el estudio, así encontramos tu ficha.</small></label>'
        + '<label class="cu-campo"><span>Correo</span><input id="cuCorreo" type="email" autocomplete="email" inputmode="email" maxlength="120" required value="' + esc(correoForm) + '"></label>'
        + '<label class="cu-campo"><span>Contraseña</span><input id="cuClave" type="password" autocomplete="new-password" minlength="8" maxlength="72" required><small>Mínimo 8 caracteres.</small></label>'
        + '<label class="cu-check"><input id="cuDatos" type="checkbox"><span>Acepto que elle studio guarde mis datos para mostrarme mis tratamientos. <a href="#" data-legal="privacidad">Política de privacidad</a></span></label>'
        + '<label class="cu-check"><input id="cuPromos" type="checkbox"><span>Quiero recibir promociones y descuentos por correo.</span></label>'
        + '<button class="cu-btn" type="submit">Crear mi cuenta</button></form>';
    } else if(modo === 'olvide'){
      f = '<form id="cuFormOlvide" novalidate>'
        + '<p class="cu-dato" style="margin:0 0 16px;">' + (codigoEnviado ? 'Te enviamos un código de 6 números. Escríbelo aquí con tu contraseña nueva.' : 'Escribe tu correo y te enviamos un código para crear una contraseña nueva.') + '</p>'
        + '<label class="cu-campo"><span>Correo</span><input id="cuCorreo" type="email" autocomplete="email" inputmode="email" maxlength="120" required value="' + esc(correoForm) + '"></label>'
        + (codigoEnviado
            ? '<label class="cu-campo"><span>Código</span><input id="cuCodigo" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required></label>'
              + '<label class="cu-campo"><span>Contraseña nueva</span><input id="cuNueva" type="password" autocomplete="new-password" minlength="8" maxlength="72" required><small>Mínimo 8 caracteres.</small></label>'
              + '<button class="cu-btn" type="submit">Guardar contraseña</button>'
            : '<button class="cu-btn" type="submit">Enviarme un código</button>')
        + '<button class="cu-link" type="button" data-modo="entrar">Volver</button></form>';
    } else {
      f = '<form id="cuFormEntrar" novalidate>'
        + '<label class="cu-campo"><span>Correo</span><input id="cuCorreo" type="email" autocomplete="email" inputmode="email" maxlength="120" required value="' + esc(correoForm) + '"></label>'
        + '<label class="cu-campo"><span>Contraseña</span><input id="cuClave" type="password" autocomplete="current-password" maxlength="72" required></label>'
        + '<button class="cu-btn" type="submit">Entrar</button>'
        + '<button class="cu-link" type="button" data-modo="olvide">Olvidé mi contraseña</button></form>';
    }
    return '<div class="cu-acceso">'
      + '<div class="cu-intro"><span class="cu-ceja">Mi cuenta</span><h2 class="cu-h2">Tu espacio en elle studio</h2>'
      + '<p>Entra con tu correo para ver tus tratamientos, cuántas sesiones llevas, tu próxima cita y tus descuentos.</p></div>'
      + '<ul class="cu-beneficios">'
      + '<li><span class="cu-ico">' + ICO.trat + '</span>Tus tratamientos y tu avance</li>'
      + '<li><span class="cu-ico">' + ICO.ses + '</span>Todas tus sesiones con fecha</li>'
      + '<li><span class="cu-ico">' + ICO.cita + '</span>Tu próxima cita</li>'
      + '<li><span class="cu-ico">' + ICO.desc + '</span>Descuentos solo para clientas</li></ul>'
      + '<div class="cu-tarjeta">'
      + (modo === 'olvide' ? '<span class="cu-ceja">Recuperar contraseña</span>'
          : '<div class="cu-pestanas" role="tablist"><button type="button" role="tab" data-modo="entrar" class="' + (modo === 'entrar' ? 'on' : '') + '" aria-selected="' + (modo === 'entrar') + '">Entrar</button><button type="button" role="tab" data-modo="crear" class="' + (modo === 'crear' ? 'on' : '') + '" aria-selected="' + (modo === 'crear') + '">Crear cuenta</button></div>')
      + htmlAviso() + f + '</div></div>';
  }

  // ---------- perfil de la clienta ----------
  function htmlTratamiento(t){
    var n = +t.sesiones || 0, extra = '';
    if(t.frecuencia && t.ultima){
      var u = aFecha(t.ultima), sig = new Date(u.getFullYear(), u.getMonth(), u.getDate() + (+t.frecuencia));
      if(sig <= hoy()) extra = '<p class="cu-toca">Ya te toca tu próxima sesión <button class="cu-btn cu-btn-chico" type="button" data-accion="reservar">Reservar</button></p>';
      else extra = '<p class="cu-dato">Tu próxima sesión: desde el ' + esc(fecha(sig.getFullYear() + '-' + (sig.getMonth() + 1) + '-' + sig.getDate(), true)) + '</p>';
    }
    var zonas = (t.zonas || []).filter(function(z){ return z && z.nombre; });
    return '<div class="cu-trat"><div class="cu-trat-cab"><b>' + esc(t.servicio || 'Tratamiento') + '</b>' + (t.plan ? '<span class="cu-chip">' + esc(t.plan) + '</span>' : '') + '</div>'
      + '<div class="cu-num"><strong>' + n + '</strong><span>' + (n === 1 ? 'sesión' : 'sesiones') + '</span></div>'
      + (t.inicio ? '<p class="cu-dato">Empezaste el ' + esc(fecha(t.inicio)) + '</p>' : '')
      + (t.ultima ? '<p class="cu-dato">Última sesión: ' + esc(fecha(t.ultima)) + '</p>' : '')
      + extra
      + (zonas.length > 1 || (zonas.length === 1 && zonas[0].nombre !== t.servicio)
          ? '<ul class="cu-zonas">' + zonas.map(function(z){ var k = +z.sesiones || 0; return '<li><span>' + esc(z.nombre) + '</span><small>' + k + (k === 1 ? ' sesión' : ' sesiones') + ' · ' + (z.estado === 'concluida' ? 'Terminada' : 'En curso') + '</small></li>'; }).join('') + '</ul>'
          : '')
      + '</div>';
  }
  function htmlPerfil(){
    var d = datos, c = d.cuenta || {}, partes = [];
    partes.push('<div class="cu-cab"><div><span class="cu-ceja">Mi cuenta</span><h2 class="cu-h2">Hola, ' + esc(primerNombre(c.nombre)) + '</h2><p class="cu-sub">' + esc(c.correo) + '</p></div>'
      + '<button class="cu-btn cu-btn-linea" type="button" data-accion="salir">Cerrar sesión</button></div>');
    if(aviso) partes.push(htmlAviso());
    if(c.estado !== 'vinculada'){
      partes.push('<div class="cu-caja"><b style="display:block;font-size:18px;margin-bottom:6px;">Estamos confirmando tus datos</b><p class="cu-dato" style="font-size:15px;line-height:1.55;">En cuanto el estudio una tu cuenta con tu ficha, aquí verás tus tratamientos y tus sesiones. Suele ser el mismo día.</p></div>');
    }
    if(d.proxima_cita){
      var p = d.proxima_cita;
      partes.push('<div class="cu-oscura"><div><span class="cu-ceja">Tu próxima cita</span><b class="cu-grande">' + esc(fecha(p.fecha, true)) + '</b><p>' + esc([p.hora, p.servicio].filter(Boolean).join(' · ')) + '</p></div>'
        + '<a class="cu-btn cu-btn-chico" href="' + waEnlace('Hola, quiero consultar sobre mi cita del ' + fecha(p.fecha, true) + '.') + '" target="_blank" rel="noopener">Consultar por WhatsApp</a></div>');
    }
    if(c.estado === 'vinculada'){
      var tr = d.tratamientos || [];
      partes.push('<section><h3 class="cu-h3">Tus tratamientos</h3>' + (tr.length ? '<div class="cu-grid">' + tr.map(htmlTratamiento).join('') + '</div>' : '<p class="cu-vacio">Todavía no hay tratamientos registrados.</p>') + '</section>');
    }
    var ds = d.descuentos || [];
    partes.push('<section><h3 class="cu-h3">Tus descuentos</h3>' + (ds.length
      ? '<div class="cu-grid">' + ds.map(function(x){
          return '<div class="cu-desc"><span class="cu-ceja">' + (x.tuyo ? 'Solo para ti' : 'Para clientas') + '</span><b>' + esc(x.titulo) + '</b>'
            + (x.detalle ? '<p>' + esc(x.detalle) + '</p>' : '') + (x.codigo ? '<span class="cu-codigo">' + esc(x.codigo) + '</span>' : '')
            + (x.vence ? '<small>Válido hasta el ' + esc(fecha(x.vence)) + '</small>' : '') + '</div>';
        }).join('') + '</div>'
      : '<p class="cu-vacio">Por ahora no tienes descuentos. Te avisaremos cuando haya uno para ti.</p>') + '</section>');
    if(c.estado === 'vinculada'){
      var h = d.historial || [], vis = verTodo ? h : h.slice(0, 6);
      if(h.length) partes.push('<section><h3 class="cu-h3">Tus últimas sesiones</h3><ul class="cu-hist">' + vis.map(function(s){
          return '<li><span>' + esc([s.servicio, s.zona && s.zona !== s.servicio ? s.zona : ''].filter(Boolean).join(' · ')) + '</span><time datetime="' + esc(s.fecha) + '">' + esc(fecha(s.fecha)) + '</time></li>';
        }).join('') + '</ul>' + (h.length > 6 ? '<button class="cu-link" type="button" data-accion="vertodo">' + (verTodo ? 'Ver menos' : 'Ver todas') + '</button>' : '') + '</section>');
    }
    partes.push('<section><h3 class="cu-h3">Preferencias</h3><div class="cu-pref">'
      + '<label class="cu-check" style="margin:0;"><input id="cuPrefPromos" type="checkbox"' + (c.acepta_promos ? ' checked' : '') + '><span>Quiero recibir promociones y descuentos por correo.</span></label>'
      + '<details><summary>Cambiar contraseña</summary><form id="cuFormClave" novalidate>'
      + '<label class="cu-campo"><span>Contraseña actual</span><input id="cuActual" type="password" autocomplete="current-password" maxlength="72" required></label>'
      + '<label class="cu-campo"><span>Contraseña nueva</span><input id="cuNueva" type="password" autocomplete="new-password" minlength="8" maxlength="72" required><small>Mínimo 8 caracteres.</small></label>'
      + '<button class="cu-btn" type="submit">Guardar contraseña</button></form></details></div></section>');
    return '<div class="cu-perfil">' + partes.join('') + '</div>';
  }

  function render(){
    if(token && !datos){ caja.innerHTML = '<p class="cu-vacio" style="margin-top:24px;">Cargando tu cuenta…</p>'; return; }
    caja.innerHTML = token && datos ? htmlPerfil() : htmlAcceso();
  }

  function cargarDatos(){
    if(!token){ datos = null; render(); return; }
    render();
    rpc('portal_mis_datos', { p_token: token }).then(function(d){
      if(!d || !d.ok){ guardarToken(null); datos = null; aviso = { tipo: 'error', txt: 'Tu sesión terminó. Vuelve a entrar.' }; modo = 'entrar'; render(); return; }
      datos = d; render();
    }).catch(function(){
      datos = null; aviso = { tipo: 'error', txt: 'No pudimos conectar. Revisa tu internet e intenta de nuevo.' };
      caja.innerHTML = '<div class="cu-perfil">' + htmlAviso() + '<button class="cu-btn cu-btn-chico" type="button" data-accion="reintentar">Intentar de nuevo</button></div>';
    });
  }

  function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function ocupado(form, si, txt){
    var b = form && form.querySelector('button[type="submit"]'); if(!b) return;
    if(si){ b.dataset.txt = b.textContent; b.textContent = txt || 'Un momento…'; b.disabled = true; }
    else { b.textContent = b.dataset.txt || b.textContent; b.disabled = false; }
  }
  function fallo(form){ ocupado(form, false); aviso = { tipo: 'error', txt: 'No pudimos conectar. Revisa tu internet e intenta de nuevo.' }; render(); }
  function entrarCon(tk){ guardarToken(tk); aviso = null; modo = 'entrar'; codigoEnviado = false; datos = null; cargarDatos(); try{ window.scrollTo(0, 0); }catch(e){} }

  caja.addEventListener('submit', function(e){
    var form = e.target; e.preventDefault();
    if(form.id === 'cuFormEntrar'){
      correoForm = val('cuCorreo');
      if(!correoForm || !val('cuClave')){ aviso = { tipo: 'error', txt: 'Escribe tu correo y tu contraseña.' }; render(); return; }
      ocupado(form, true, 'Entrando…');
      rpc('portal_entrar', { p_correo: correoForm, p_clave: document.getElementById('cuClave').value })
        .then(function(d){ if(d && d.ok) entrarCon(d.token); else { ocupado(form, false); aviso = { tipo: 'error', txt: (d && d.error) || 'No se pudo entrar.' }; render(); } })
        .catch(function(){ fallo(form); });
    } else if(form.id === 'cuFormCrear'){
      correoForm = val('cuCorreo');
      var datosOk = document.getElementById('cuDatos').checked;
      ocupado(form, true, 'Creando tu cuenta…');
      rpc('portal_registrar', { p_correo: correoForm, p_clave: document.getElementById('cuClave').value, p_nombre: val('cuNombre'), p_telefono: val('cuTel'),
          p_acepta_datos: datosOk, p_acepta_promos: document.getElementById('cuPromos').checked })
        .then(function(d){
          if(d && d.ok) entrarCon(d.token);
          else { ocupado(form, false); var guardado = { n: val('cuNombre'), t: val('cuTel') }; aviso = { tipo: 'error', txt: (d && d.error) || 'No se pudo crear la cuenta.' }; render();
                 var n = document.getElementById('cuNombre'), t = document.getElementById('cuTel'), k = document.getElementById('cuDatos');
                 if(n) n.value = guardado.n; if(t) t.value = guardado.t; if(k) k.checked = datosOk; }
        })
        .catch(function(){ fallo(form); });
    } else if(form.id === 'cuFormOlvide'){
      correoForm = val('cuCorreo');
      if(!codigoEnviado){
        ocupado(form, true, 'Enviando…');
        rpc('portal_pedir_codigo', { p_correo: correoForm }).then(function(d){
          if(d && d.sin_correo){ ocupado(form, false); aviso = { tipo: 'ok', txt: 'Por ahora te ayudamos a recuperar tu contraseña por WhatsApp.', wa: 'Hola, olvidé la contraseña de mi cuenta en la página web. Mi correo es ' + correoForm }; render(); return; }
          codigoEnviado = true; aviso = { tipo: 'ok', txt: 'Si ese correo tiene una cuenta, te llegará un código en un minuto. Revisa también la carpeta de spam.' }; render();
        }).catch(function(){ fallo(form); });
      } else {
        ocupado(form, true, 'Guardando…');
        rpc('portal_restablecer', { p_correo: correoForm, p_codigo: val('cuCodigo'), p_nueva: document.getElementById('cuNueva').value })
          .then(function(d){ if(d && d.ok) entrarCon(d.token); else { ocupado(form, false); aviso = { tipo: 'error', txt: (d && d.error) || 'No se pudo guardar.' }; render(); } })
          .catch(function(){ fallo(form); });
      }
    } else if(form.id === 'cuFormClave'){
      ocupado(form, true, 'Guardando…');
      rpc('portal_cambiar_clave', { p_token: token, p_actual: document.getElementById('cuActual').value, p_nueva: document.getElementById('cuNueva').value })
        .then(function(d){ ocupado(form, false); aviso = d && d.ok ? { tipo: 'ok', txt: 'Listo, tu contraseña nueva ya está guardada.' } : { tipo: 'error', txt: (d && d.error) || 'No se pudo cambiar.' }; render(); })
        .catch(function(){ fallo(form); });
    }
  });

  caja.addEventListener('change', function(e){
    if(e.target && e.target.id === 'cuPrefPromos'){
      var si = e.target.checked;
      rpc('portal_preferencias', { p_token: token, p_acepta_promos: si }).then(function(d){
        if(d && d.ok){ if(datos && datos.cuenta) datos.cuenta.acepta_promos = si; aviso = { tipo: 'ok', txt: si ? 'Listo, te enviaremos promociones por correo.' : 'Listo, ya no te enviaremos promociones.' }; render(); }
      }).catch(function(){ e.target.checked = !si; });
    }
  });

  caja.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('[data-modo],[data-accion],[data-legal]') : null;
    if(!t) return;
    if(t.hasAttribute('data-legal')){ e.preventDefault(); if(window.verLegal) window.verLegal(t.getAttribute('data-legal')); return; }
    if(t.hasAttribute('data-modo')){
      var c = document.getElementById('cuCorreo'); if(c) correoForm = c.value.trim();
      modo = t.getAttribute('data-modo'); aviso = null; codigoEnviado = false; render();
      var primero = caja.querySelector('form input'); if(primero && window.innerWidth > 860) try{ primero.focus(); }catch(err){}
      return;
    }
    var a = t.getAttribute('data-accion');
    if(a === 'salir'){
      var tk = token; guardarToken(null); datos = null; aviso = { tipo: 'ok', txt: 'Cerraste tu sesión.' }; modo = 'entrar'; render();
      rpc('portal_salir', { p_token: tk }).catch(function(){});
    } else if(a === 'reservar'){ if(window.abrirReserva) window.abrirReserva(); }
    else if(a === 'vertodo'){ verTodo = !verTodo; render(); }
    else if(a === 'reintentar'){ aviso = null; cargarDatos(); }
  });

  // Enlace «No quiero recibir más promociones» de los correos: ?baja=...
  var m = /[?&]baja=([a-f0-9]{20,64})/i.exec(location.search);
  if(m){
    try{ var u = new URL(location.href); u.searchParams.delete('baja'); history.replaceState(null, '', u.pathname + u.search + '#cuenta'); }catch(e){}
    if(window.verVista) window.verVista('cuenta');
    rpc('portal_baja', { p_baja: m[1] }).then(function(d){
      aviso = d && d.ok ? { tipo: 'ok', txt: 'Listo. Ya no te enviaremos promociones por correo.' } : { tipo: 'error', txt: 'Ese enlace ya no es válido.' };
      if(datos && datos.cuenta && d && d.ok) datos.cuenta.acepta_promos = false;
      render();
    }).catch(function(){});
  }

  marcarBoton();
  if(token) cargarDatos(); else render();
})();
