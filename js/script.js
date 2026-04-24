/**
 * ==========================================================
 * Clínica Central IMA - Proyecto Final JavaScript
 * ==========================================================
 * Este archivo contiene toda la lógica principal del simulador:
 * - carga de especialidades desde JSON
 * - registro e inicio de sesión de pacientes
 * - reserva, búsqueda y cancelación de turnos
 * - persistencia de datos con localStorage
 * - renderizado dinámico del HTML
 */

// ==========================================================
// CLAVES DE LOCALSTORAGE
// Se usan para guardar y recuperar datos del navegador.
// ==========================================================
const CLAVES_STORAGE = {
  usuarios: "clinica_usuarios",
  turnos: "clinica_turnos",
  usuarioActual: "clinica_usuario_actual",
};

// ==========================================================
// DATOS DE RESPALDO
// Si el archivo JSON no carga por algún motivo, el sistema usa
// estas especialidades como respaldo para no dejar la sección vacía.
// ==========================================================
const ESPECIALIDADES_RESPALDO = [
  {
    id: 1,
    nombre: "Clínica Médica",
    doctor: "Dr. Martín López",
    obraSocial: "OSDE",
    emoji: "🩺",
    colorFondo: "#dbeafe",
    colorTexto: "#2563eb",
    descripcion: "Consultas generales, controles y seguimiento clínico.",
    duracion: "30 min",
  },
  {
    id: 2,
    nombre: "Pediatría",
    doctor: "Dra. Paula Santucho",
    obraSocial: "Swiss Medical",
    emoji: "👶",
    colorFondo: "#fce7f3",
    colorTexto: "#db2777",
    descripcion: "Atención integral para bebés, niños y adolescentes.",
    duracion: "25 min",
  },
  {
    id: 3,
    nombre: "Dermatología",
    doctor: "Dr. Tomás Duarte",
    obraSocial: "Galeno",
    emoji: "✨",
    colorFondo: "#fef3c7",
    colorTexto: "#d97706",
    descripcion: "Control de piel, lunares, acné y tratamientos especializados.",
    duracion: "20 min",
  },
  {
    id: 4,
    nombre: "Cardiología",
    doctor: "Dra. Valentina Juárez",
    obraSocial: "Medifé",
    emoji: "❤️",
    colorFondo: "#fee2e2",
    colorTexto: "#dc2626",
    descripcion: "Chequeos cardiovasculares, ECG y seguimiento cardíaco.",
    duracion: "40 min",
  },
  {
    id: 5,
    nombre: "Traumatología",
    doctor: "Dr. Diego Zapata",
    obraSocial: "IOMA",
    emoji: "🦴",
    colorFondo: "#d1fae5",
    colorTexto: "#059669",
    descripcion: "Lesiones óseas, musculares y rehabilitación.",
    duracion: "30 min",
  },
  {
    id: 6,
    nombre: "Neurología",
    doctor: "Dra. Luz Arzamendia",
    obraSocial: "Todas",
    emoji: "🧠",
    colorFondo: "#f3e8ff",
    colorTexto: "#7c3aed",
    descripcion: "Consulta neurológica, cefaleas y seguimiento clínico.",
    duracion: "35 min",
  },
  {
    id: 7,
    nombre: "Ginecología",
    doctor: "Dra. Camila Ferreira",
    obraSocial: "OSDE / Swiss Medical",
    emoji: "🌷",
    colorFondo: "#fdf2f8",
    colorTexto: "#be185d",
    descripcion: "Controles ginecológicos, estudios preventivos y orientación integral.",
    duracion: "30 min",
  },
  {
    id: 8,
    nombre: "Oftalmología",
    doctor: "Dr. Ignacio Rivas",
    obraSocial: "Particular / Galeno",
    emoji: "👁️",
    colorFondo: "#ecfeff",
    colorTexto: "#0891b2",
    descripcion: "Controles visuales, receta de lentes y estudios oftalmológicos.",
    duracion: "20 min",
  },
];

// ==========================================================
// ESTADO GENERAL DE LA APLICACIÓN
// Guarda datos temporales usados por la interfaz.
// ==========================================================
const estado = {
  especialidades: [],
  terminoBusqueda: "",
  filtroEspecialidad: "all",
};

// ==========================================================
// FUNCIONES DE STORAGE
// Leen y escriben información persistente en localStorage.
// ==========================================================
function leerStorage(clave, valorPorDefecto) {
  return JSON.parse(localStorage.getItem(clave) || JSON.stringify(valorPorDefecto));
}

function guardarStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function obtenerUsuarios() {
  return leerStorage(CLAVES_STORAGE.usuarios, []);
}

function guardarUsuarios(usuarios) {
  guardarStorage(CLAVES_STORAGE.usuarios, usuarios);
}

function obtenerTurnos() {
  return leerStorage(CLAVES_STORAGE.turnos, []);
}

function guardarTurnos(turnos) {
  guardarStorage(CLAVES_STORAGE.turnos, turnos);
}

function obtenerUsuarioActual() {
  return leerStorage(CLAVES_STORAGE.usuarioActual, null);
}

function guardarUsuarioActual(usuario) {
  guardarStorage(CLAVES_STORAGE.usuarioActual, usuario);
}

function limpiarUsuarioActual() {
  localStorage.removeItem(CLAVES_STORAGE.usuarioActual);
}

// ==========================================================
// UTILIDADES GENERALES
// Normalizan y validan datos ingresados por el usuario.
// ==========================================================
function normalizarTexto(texto) {
  return texto.trim().replace(/\s+/g, " ");
}

function soloNumeros(texto) {
  return texto.replace(/\D/g, "");
}

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatearFecha(fechaTexto) {
  const [anio, mes, dia] = fechaTexto.split("-");
  return `${dia}/${mes}/${anio}`;
}

function obtenerInfoEspecialidad(nombre) {
  return estado.especialidades.find((especialidad) => especialidad.nombre === nombre);
}

// ==========================================================
// NOTIFICACIONES
// Usa Toastify para mensajes rápidos arriba a la derecha.
// ==========================================================
function mostrarToast(mensaje, tipo = "success") {
  const fondo =
    tipo === "error"
      ? "linear-gradient(135deg, #dc2626, #ef4444)"
      : "linear-gradient(135deg, #6d28d9, #a855f7)";

  Toastify({
    text: mensaje,
    duration: 2800,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: { background: fondo },
  }).showToast();
}

// ==========================================================
// CARGA DE ESPECIALIDADES DESDE JSON
// Intenta leer data/especialidades.json.
// Si falla, usa ESPECIALIDADES_RESPALDO.
// ==========================================================
async function cargarEspecialidades() {
  try {
    const respuesta = await fetch("./data/especialidades.json");

    if (!respuesta.ok) {
      throw new Error("No se pudo leer el archivo JSON.");
    }

    const datos = await respuesta.json();
    estado.especialidades = Array.isArray(datos) ? datos : ESPECIALIDADES_RESPALDO;
  } catch (error) {
    estado.especialidades = [...ESPECIALIDADES_RESPALDO];
    console.warn("Se usaron especialidades de respaldo:", error);
  }
}

// ==========================================================
// RENDER DE ESPECIALIDADES
// Genera las tarjetas visuales en la sección correspondiente.
// ==========================================================
function renderizarEspecialidades() {
  const grilla = document.getElementById("specialtiesGrid");
  if (!grilla) return;

  grilla.innerHTML = estado.especialidades
    .map(
      (especialidad) => `
      <article class="specialty-card">
        <div class="specialty-icon" style="background:${especialidad.colorFondo}; color:${especialidad.colorTexto}">
          ${especialidad.emoji}
        </div>
        <h3>${especialidad.nombre}</h3>
        <p class="doctor">${especialidad.doctor}</p>
        <p class="specialty-desc">${especialidad.descripcion}</p>
        <div class="specialty-meta">
          <span class="specialty-badge">${especialidad.obraSocial || "Particular"}</span>
        </div>
      </article>
    `
    )
    .join("");
}

// ==========================================================
// CARGA DE OPCIONES EN LOS SELECT
// Llena el select del formulario y el select del filtro.
// ==========================================================
function cargarOpcionesEspecialidades() {
  const selectEspecialidad = document.getElementById("especialidad");
  const selectFiltro = document.getElementById("filterSpecialty");

  if (!selectEspecialidad || !selectFiltro) return;

  selectEspecialidad.innerHTML = '<option value="">Seleccioná una especialidad</option>';
  selectFiltro.innerHTML = '<option value="all">Todas las especialidades</option>';

  estado.especialidades.forEach((especialidad) => {
    const opcionReserva = document.createElement("option");
    opcionReserva.value = especialidad.nombre;
    opcionReserva.textContent = `${especialidad.nombre} - ${especialidad.doctor}`;
    selectEspecialidad.appendChild(opcionReserva);

    const opcionFiltro = document.createElement("option");
    opcionFiltro.value = especialidad.nombre;
    opcionFiltro.textContent = especialidad.nombre;
    selectFiltro.appendChild(opcionFiltro);
  });
}

// ==========================================================
// TARJETAS DE ESTADÍSTICAS
// Actualiza contadores visibles en pantalla.
// ==========================================================
function actualizarEstadisticas() {
  const usuarioActual = obtenerUsuarioActual();

  document.getElementById("statSpecialties").textContent = estado.especialidades.length;
  document.getElementById("statUsers").textContent = obtenerUsuarios().length;
  document.getElementById("statAppointments").textContent = obtenerTurnos().length;
  document.getElementById("statSession").textContent = usuarioActual ? usuarioActual.nombre : "Sin iniciar";
}

// ==========================================================
// TURNOS - FILTROS Y RENDER
// Permite buscar por nombre/DNI y filtrar por especialidad.
// ==========================================================
function filtrarTurnos(turnos) {
  return turnos.filter((turno) => {
    const coincideBusqueda =
      turno.nombre.toLowerCase().includes(estado.terminoBusqueda) || turno.dni.includes(estado.terminoBusqueda);

    const coincideEspecialidad =
      estado.filtroEspecialidad === "all" || turno.especialidad === estado.filtroEspecialidad;

    return coincideBusqueda && coincideEspecialidad;
  });
}

function renderizarTurnos() {
  const contenedor = document.getElementById("appointmentsList");
  if (!contenedor) return;

  const turnosFiltrados = filtrarTurnos(obtenerTurnos());

  if (turnosFiltrados.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state">
        <p>No hay turnos que coincidan con la búsqueda actual.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = turnosFiltrados
    .map((turno) => {
      const infoEspecialidad = obtenerInfoEspecialidad(turno.especialidad);
      const puedeCancelar = obtenerUsuarioActual() && obtenerUsuarioActual().email === turno.emailUsuario;

      return `
        <article class="appointment-card">
          <div class="appointment-card-header">
            <div>
              <h4>${turno.nombre}</h4>
              <span class="appointment-badge">${turno.especialidad}</span>
            </div>
            ${puedeCancelar
              ? `<button class="icon-action-btn" data-id="${turno.id}" title="Cancelar turno">✖</button>`
              : `<span class="mini-tag">Paciente</span>`}
          </div>

          <div class="appointment-card-body">
            <p><strong>DNI:</strong> ${turno.dni}</p>
            <p><strong>Fecha:</strong> ${formatearFecha(turno.fecha)}</p>
            <p><strong>Horario:</strong> ${turno.hora} hs</p>
            <p><strong>Profesional:</strong> ${infoEspecialidad ? infoEspecialidad.doctor : "A confirmar"}</p>
            <p><strong>Email:</strong> ${turno.emailUsuario || "Invitado"}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

// ==========================================================
// SESIÓN ACTIVA
// Muestra en pantalla quién inició sesión y autocompleta turno.
// ==========================================================
function renderizarSesion() {
  const panelSesion = document.getElementById("sessionPanel");
  const textoSesion = document.getElementById("sessionUserText");
  const usuarioActual = obtenerUsuarioActual();

  if (!panelSesion || !textoSesion) return;

  if (usuarioActual) {
    panelSesion.classList.remove("hidden");
    textoSesion.textContent = `${usuarioActual.nombre} ${usuarioActual.apellido} - ${usuarioActual.email}`;
  } else {
    panelSesion.classList.add("hidden");
    textoSesion.textContent = "";
  }

  autocompletarFormularioTurno();
  actualizarEstadisticas();
}

function autocompletarFormularioTurno() {
  const usuarioActual = obtenerUsuarioActual();
  const inputNombre = document.getElementById("nombrePaciente");
  const inputDni = document.getElementById("dniPaciente");

  if (!inputNombre || !inputDni || !usuarioActual) return;

  inputNombre.value = `${usuarioActual.nombre} ${usuarioActual.apellido}`;
  inputDni.value = usuarioActual.dni;
}

// ==========================================================
// FORMULARIO DE TURNOS
// Crea objeto turno a partir de los campos del formulario.
// ==========================================================
function construirTurnoDesdeFormulario() {
  return {
    id: Date.now(),
    nombre: normalizarTexto(document.getElementById("nombrePaciente").value),
    dni: soloNumeros(document.getElementById("dniPaciente").value),
    especialidad: document.getElementById("especialidad").value,
    fecha: document.getElementById("fechaTurno").value, // fecha elegida para el turno
    hora: document.getElementById("horarioTurno").value, // hora = horario elegido para la consulta
    emailUsuario: obtenerUsuarioActual()?.email || "",
  };
}

function validarTurno(turno) {
  if (!obtenerUsuarioActual()) {
    mostrarToast("Primero iniciá sesión en el portal del paciente.", "error");
    return false;
  }

  if (!turno.nombre || !turno.dni || !turno.especialidad || !turno.fecha || !turno.hora) {
    mostrarToast("Completá todos los campos del turno.", "error");
    return false;
  }

  if (turno.nombre.length < 3) {
    mostrarToast("Ingresá un nombre válido.", "error");
    return false;
  }

  if (turno.dni.length < 7 || turno.dni.length > 8) {
    mostrarToast("El DNI debe tener entre 7 y 8 números.", "error");
    return false;
  }

  const duplicado = obtenerTurnos().some(
    (item) => item.fecha === turno.fecha && item.hora === turno.hora && item.dni === turno.dni
  );

  if (duplicado) {
    mostrarToast("Ese turno ya existe para el paciente seleccionado.", "error");
    return false;
  }

  return true;
}

function configurarFormularioTurnos() {
  const formulario = document.getElementById("appointmentForm");
  const inputFecha = document.getElementById("fechaTurno");
  const botonLimpiar = document.getElementById("clearAppointmentsBtn");

  if (!formulario || !inputFecha) return;

  inputFecha.min = new Date().toISOString().split("T")[0];

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const turno = construirTurnoDesdeFormulario();
    if (!validarTurno(turno)) return;

    const infoEspecialidad = obtenerInfoEspecialidad(turno.especialidad);

    const resultado = await Swal.fire({
      title: "¿Confirmar turno?",
      html: `
        <p><strong>Especialidad:</strong> ${turno.especialidad}</p>
        <p><strong>Profesional:</strong> ${infoEspecialidad ? infoEspecialidad.doctor : "A confirmar"}</p>
        <p><strong>Fecha:</strong> ${formatearFecha(turno.fecha)}</p>
        <p><strong>Horario:</strong> ${turno.hora} hs</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, reservar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#6d28d9",
    });

    if (!resultado.isConfirmed) return;

    const turnos = obtenerTurnos();
    turnos.push(turno);
    guardarTurnos(turnos);

    formulario.reset();
    autocompletarFormularioTurno();
    renderizarTurnos();
    actualizarEstadisticas();
    mostrarToast("Turno confirmado con éxito.");
  });

  botonLimpiar?.addEventListener("click", async () => {
    if (obtenerTurnos().length === 0) {
      mostrarToast("No hay turnos para eliminar.", "error");
      return;
    }

    const resultado = await Swal.fire({
      title: "¿Eliminar todos los turnos?",
      text: "Esta acción borra todos los turnos guardados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Volver",
      confirmButtonColor: "#dc2626",
    });

    if (!resultado.isConfirmed) return;

    localStorage.removeItem(CLAVES_STORAGE.turnos);
    renderizarTurnos();
    actualizarEstadisticas();
    mostrarToast("Se eliminaron todos los turnos.");
  });
}

function configurarHerramientasTurnos() {
  const inputBusqueda = document.getElementById("searchAppointment");
  const selectFiltro = document.getElementById("filterSpecialty");
  const listaTurnos = document.getElementById("appointmentsList");

  inputBusqueda?.addEventListener("input", (evento) => {
    estado.terminoBusqueda = evento.target.value.trim().toLowerCase();
    renderizarTurnos();
  });

  selectFiltro?.addEventListener("change", (evento) => {
    estado.filtroEspecialidad = evento.target.value;
    renderizarTurnos();
  });

  listaTurnos?.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("[data-id]");
    if (!boton) return;

    const idTurno = Number(boton.dataset.id);
    const turno = obtenerTurnos().find((item) => item.id === idTurno);
    if (!turno) return;

    const resultado = await Swal.fire({
      title: "¿Cancelar turno?",
      text: `${turno.especialidad} - ${formatearFecha(turno.fecha)} a las ${turno.hora} hs`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#dc2626",
    });

    if (!resultado.isConfirmed) return;

    const turnosActualizados = obtenerTurnos().filter((item) => item.id !== idTurno);
    guardarTurnos(turnosActualizados);
    renderizarTurnos();
    actualizarEstadisticas();
    mostrarToast("El turno fue cancelado.");
  });
}

// ==========================================================
// PORTAL DEL PACIENTE
// Maneja pestañas, registro, login y logout.
// ==========================================================
function configurarPestaniasPortal() {
  return;
}

function construirUsuarioDesdeFormulario() {
  return {
    nombre: normalizarTexto(document.getElementById("regName").value),
    apellido: normalizarTexto(document.getElementById("regLastname").value),
    email: document.getElementById("regEmail").value.trim().toLowerCase(),
    dni: soloNumeros(document.getElementById("regDni").value),
    obraSocial: document.getElementById("regObraSocial").value || "Sin obra social",
    password: document.getElementById("regPassword").value.trim(),
  };
}

function validarUsuario(usuario) {
  if (!usuario.nombre || !usuario.apellido || !usuario.email || !usuario.dni || !usuario.password) {
    mostrarToast("Completá todos los campos obligatorios.", "error");
    return false;
  }

  if (usuario.nombre.length < 2 || usuario.apellido.length < 2) {
    mostrarToast("Nombre y apellido deben tener al menos 2 caracteres.", "error");
    return false;
  }

  if (!esEmailValido(usuario.email)) {
    mostrarToast("Ingresá un email válido.", "error");
    return false;
  }

  if (usuario.dni.length < 7 || usuario.dni.length > 8) {
    mostrarToast("El DNI debe tener entre 7 y 8 números.", "error");
    return false;
  }

  if (usuario.password.length < 6) {
    mostrarToast("La contraseña debe tener al menos 6 caracteres.", "error");
    return false;
  }

  const usuarios = obtenerUsuarios();

  if (usuarios.some((item) => item.email === usuario.email)) {
    mostrarToast("Ese email ya está registrado.", "error");
    return false;
  }

  if (usuarios.some((item) => item.dni === usuario.dni)) {
    mostrarToast("Ese DNI ya está registrado.", "error");
    return false;
  }

  return true;
}

function configurarFormularioRegistro() {
  const formulario = document.getElementById("registerForm");
  if (!formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const usuario = construirUsuarioDesdeFormulario();
    if (!validarUsuario(usuario)) return;

    const usuarios = obtenerUsuarios();
    usuarios.push(usuario);
    guardarUsuarios(usuarios);
    guardarUsuarioActual(usuario);

    await Swal.fire({
      title: "Cuenta creada",
      text: `Bienvenida/o ${usuario.nombre}. Ya podés reservar tu turno.`,
      icon: "success",
      confirmButtonColor: "#6d28d9",
    });

    formulario.reset();
    renderizarSesion();
    renderizarTurnos();
    mostrarToast("Registro completado.");
  });
}

function configurarFormularioLogin() {
  const formulario = document.getElementById("loginForm");
  const botonLogout = document.getElementById("logoutBtn");

  formulario?.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      mostrarToast("Completá email y contraseña.", "error");
      return;
    }

    const usuario = obtenerUsuarios().find((item) => item.email === email && item.password === password);

    if (!usuario) {
      mostrarToast("Email o contraseña incorrectos.", "error");
      return;
    }

    guardarUsuarioActual(usuario);
    formulario.reset();
    renderizarSesion();
    renderizarTurnos();
    mostrarToast(`Bienvenido/a, ${usuario.nombre}.`);
  });

  botonLogout?.addEventListener("click", () => {
    limpiarUsuarioActual();
    renderizarSesion();
    renderizarTurnos();
    mostrarToast("Sesión cerrada correctamente.");
  });
}

// ==========================================================
// NAVEGACIÓN Y EXPERIENCIA DE USUARIO
// Menú móvil, scroll suave y enlace activo.
// ==========================================================
function configurarMenuMovil() {
  const boton = document.getElementById("mobileMenuBtn");
  const links = document.getElementById("navLinks");

  boton?.addEventListener("click", () => links.classList.toggle("open"));

  links?.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => links.classList.remove("open"));
  });
}

function configurarNavegacionActiva() {
  const links = document.querySelectorAll(".nav-link");
  const secciones = document.querySelectorAll("section[id]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) => link.classList.remove("active"));
        const activo = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        activo?.classList.add("active");
      });
    },
    { threshold: 0.35 }
  );

  secciones.forEach((seccion) => observer.observe(seccion));
}

function configurarScrollSuave() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (evento) => {
      evento.preventDefault();
      const destino = document.querySelector(anchor.getAttribute("href"));
      destino?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ==========================================================
// INICIALIZACIÓN GENERAL
// Ejecuta todo al cargar la página.
// ==========================================================
async function iniciarAplicacion() {
  await cargarEspecialidades();

  renderizarEspecialidades();
  cargarOpcionesEspecialidades();
  renderizarTurnos();
  renderizarSesion();
  actualizarEstadisticas();

  configurarMenuMovil();
  configurarNavegacionActiva();
  configurarScrollSuave();
  configurarPestaniasPortal();
  configurarFormularioRegistro();
  configurarFormularioLogin();
  configurarFormularioTurnos();
  configurarHerramientasTurnos();
}

// Espera a que el HTML esté listo antes de iniciar.
document.addEventListener("DOMContentLoaded", iniciarAplicacion);
