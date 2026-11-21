/* =========================================================
   IMSS | SISTEMA DE GESTIÓN DE CITAS MÉDICAS
   Front-End | Prototipo educativo
   Almacenamiento: LocalStorage
   ========================================================= */
"use strict";

const CLAVE_USUARIO = "usuarioIMSS";
const CLAVE_CITAS = "citasIMSS";

function leerJSON(clave, defecto) {
    try {
        const contenido = localStorage.getItem(clave);
        return contenido === null ? defecto : JSON.parse(contenido);
    } catch (error) {
        console.error("Error al leer almacenamiento:", error);
        return defecto;
    }
}
function guardarJSON(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
        return true;
    } catch (error) {
        console.error("Error al guardar información:", error);
        mostrarNotificacion("No fue posible guardar los datos.", "error");
        return false;
    }
}
function obtenerUsuario() { return leerJSON(CLAVE_USUARIO, null); }
function obtenerCitas() {
    const citas = leerJSON(CLAVE_CITAS, []);
    return Array.isArray(citas) ? citas : [];
}
function generarFolio() {
    return `IMSS-${Math.floor(100000 + Math.random() * 900000)}`;
}
function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function validarNSS(nss) { return /^\d{11}$/.test(nss); }
function validarCURP(curp) { return /^[A-Z0-9]{18}$/.test(curp); }
function formatearFecha(fecha) {
    if (!fecha) return "";
    const partes = fecha.split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
}
function fechaActualLocal() {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(fecha.getDate()).padStart(2,"0")}`;
}

function mostrarNotificacion(mensaje, tipo = "success") {
    let contenedor = document.getElementById("notificaciones");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "notificaciones";
        contenedor.className = "position-fixed top-0 end-0 p-3";
        contenedor.style.zIndex = "9999";
        document.body.appendChild(contenedor);
    }
    const colores = { success:"alert-success", error:"alert-danger", warning:"alert-warning", info:"alert-info" };
    const alerta = document.createElement("div");
    alerta.className = `alert ${colores[tipo] || colores.info} shadow alert-dismissible fade show`;
    alerta.setAttribute("role", "alert");
    alerta.innerHTML = `<span>${escaparHTML(mensaje)}</span><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>`;
    contenedor.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
}

function mostrarLogin() {
    document.getElementById("aplicacion")?.classList.add("hidden");
    document.getElementById("login")?.classList.remove("hidden");
    document.getElementById("loginNss")?.focus();
}
function cerrarLogin() {
    // En la pantalla inicial, Cancelar limpia el formulario sin salir del login.
    document.getElementById("loginForm")?.reset();
}
function mostrarCita() { document.getElementById("citas")?.scrollIntoView({ behavior:"smooth" }); }
function irASeccion(id) { document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); }

function iniciarSesion(event) {
    event.preventDefault();
    const nss = document.getElementById("loginNss")?.value.trim();
    const curp = document.getElementById("loginCurp")?.value.trim().toUpperCase();
    const password = document.getElementById("loginPassword")?.value;
    if (!validarNSS(nss)) return mostrarNotificacion("El NSS debe contener exactamente 11 números.", "error");
    if (!validarCURP(curp)) return mostrarNotificacion("La CURP debe contener 18 caracteres alfanuméricos.", "error");
    if (!password || password.trim().length < 4) return mostrarNotificacion("Ingresa una contraseña válida.", "error");
    if (!guardarJSON(CLAVE_USUARIO, { nss, curp, fechaInicio:new Date().toISOString() })) return;
    document.getElementById("login")?.classList.add("hidden");
    document.getElementById("aplicacion")?.classList.remove("hidden");
    document.getElementById("loginForm")?.reset();
    actualizarPanelUsuario();
    actualizarMisCitas();
    actualizarEstadisticas();
    mostrarNotificacion("Sesión de demostración iniciada correctamente.");
    window.scrollTo({ top: 0, behavior: "smooth" });
}
function cerrarSesion() {
    localStorage.removeItem(CLAVE_USUARIO);
    document.getElementById("aplicacion")?.classList.add("hidden");
    document.getElementById("login")?.classList.remove("hidden");
    document.getElementById("loginForm")?.reset();
    actualizarPanelUsuario(); actualizarMisCitas(); actualizarEstadisticas();
    window.scrollTo({ top: 0, behavior: "smooth" });
    mostrarNotificacion("Sesión cerrada correctamente.", "info");
}
function recuperarContrasena(event) {
    event.preventDefault();
    mostrarNotificacion("La recuperación de contraseña estará disponible en una versión futura.", "info");
}

function actualizarPanelUsuario() {
    const usuario = obtenerUsuario();
    const estado = document.getElementById("estadoSesion");
    const bienvenida = document.getElementById("bienvenidaUsuario");
    const botonCerrar = document.getElementById("cerrarSesionBtn");
    if (estado) estado.textContent = usuario ? "Sesión iniciada" : "Modo demostración";
    if (bienvenida) bienvenida.textContent = usuario
        ? `Sesión activa. NSS terminado en ${usuario.nss.slice(-4)}.`
        : "Bienvenido al sistema de gestión de citas médicas.";
    if (botonCerrar) botonCerrar.classList.toggle("hidden", !usuario);
    document.querySelectorAll("[data-requiere-sesion]").forEach(el => el.classList.toggle("hidden", !usuario));
}

function confirmarCita(event) {
    event.preventDefault();
    const formulario = document.getElementById("citaForm");
    if (!formulario) return;
    if (!formulario.checkValidity()) { formulario.reportValidity(); return; }
    const nss = document.getElementById("nss")?.value.trim();
    const curp = document.getElementById("curp")?.value.trim().toUpperCase();
    const usuario = obtenerUsuario();
    if (!validarNSS(nss)) return mostrarNotificacion("El NSS debe contener exactamente 11 números.", "error");
    if (!validarCURP(curp)) return mostrarNotificacion("La CURP debe contener exactamente 18 caracteres.", "error");
    if (usuario && usuario.nss !== nss) return mostrarNotificacion("El NSS no coincide con la sesión iniciada.", "error");
    const fecha = document.getElementById("fecha")?.value;
    const hora = document.getElementById("hora")?.value;
    if (!fecha || fecha < fechaActualLocal()) return mostrarNotificacion("Selecciona una fecha válida.", "error");

    const citas = obtenerCitas();
    const duplicada = citas.some(c => c.nss === nss && c.fecha === fecha && c.hora === hora && c.estado !== "Cancelada");
    if (duplicada) return mostrarNotificacion("Ya existe una cita registrada en ese horario.", "warning");

    const cita = {
        id: Date.now().toString(), nss, curp,
        nombre: document.getElementById("nombre")?.value.trim(),
        especialidad: document.getElementById("especialidad")?.value,
        medico: document.getElementById("medico")?.value,
        unidad: document.getElementById("unidad")?.value,
        fecha, hora, motivo: document.getElementById("motivo")?.value.trim(),
        folio: generarFolio(), estado: "Confirmada", fechaRegistro: new Date().toISOString()
    };
    citas.push(cita);
    if (!guardarJSON(CLAVE_CITAS, citas)) return;
    actualizarMisCitas(); actualizarEstadisticas();
    mostrarConfirmacion(cita);
    formulario.reset();
    mostrarNotificacion("Tu cita se registró correctamente.");
}

function mostrarConfirmacion(cita) {
    const folio = document.getElementById("folio");
    const success = document.getElementById("success");
    if (folio) folio.textContent = cita.folio;
    if (success) {
        success.classList.remove("hidden");
        success.scrollIntoView({ behavior:"smooth", block:"center" });
    }
    const detalle = document.getElementById("detalleCita");
    if (detalle) detalle.innerHTML = `
        <p><strong>Folio:</strong> ${escaparHTML(cita.folio)}</p>
        <p><strong>Especialidad:</strong> ${escaparHTML(cita.especialidad)}</p>
        <p><strong>Fecha:</strong> ${escaparHTML(formatearFecha(cita.fecha))}</p>
        <p><strong>Hora:</strong> ${escaparHTML(cita.hora)}</p>
        <p><strong>Unidad médica:</strong> ${escaparHTML(cita.unidad)}</p>`;
}

function actualizarMisCitas() {
    const lista = document.getElementById("listaCitas");
    const total = document.getElementById("totalCitas");
    if (!lista) return;
    const usuario = obtenerUsuario();
    const citas = usuario ? obtenerCitas().filter(c => c.nss === usuario.nss) : obtenerCitas();
    if (total) total.textContent = citas.length;
    if (!citas.length) {
        lista.innerHTML = `<div class="list-group-item text-center py-4"><div class="fs-1 mb-2">📅</div><h6 class="mb-1">Sin citas registradas</h6><p class="text-secondary mb-0">${usuario ? "Todavía no tienes citas registradas." : "Inicia sesión para consultar tus citas."}</p></div>`;
        return;
    }
    lista.innerHTML = citas.slice().sort((a,b) => b.fecha.localeCompare(a.fecha)).map(crearTarjetaCita).join("");
}

function crearTarjetaCita(cita) {
    const estado = cita.estado || "Confirmada";
    const claseEstado = estado === "Cancelada" ? "text-bg-danger" : "text-bg-success";
    return `<div class="list-group-item py-3">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div><h6 class="fw-bold mb-1">${escaparHTML(cita.especialidad)}</h6><div class="small text-secondary">${escaparHTML(cita.medico)}</div></div>
            <span class="badge ${claseEstado}">${escaparHTML(estado)}</span>
        </div><hr>
        <div class="row g-2 small">
            <div class="col-md-6"><strong>Fecha:</strong> ${escaparHTML(formatearFecha(cita.fecha))}</div>
            <div class="col-md-6"><strong>Hora:</strong> ${escaparHTML(cita.hora)}</div>
            <div class="col-md-12"><strong>Unidad:</strong> ${escaparHTML(cita.unidad)}</div>
            <div class="col-md-12"><strong>Folio:</strong> ${escaparHTML(cita.folio)}</div>
            ${cita.motivo ? `<div class="col-md-12"><strong>Motivo:</strong> ${escaparHTML(cita.motivo)}</div>` : ""}
        </div>
        ${estado !== "Cancelada" ? `<div class="mt-3 text-end"><button class="btn btn-outline-danger btn-sm" onclick="cancelarCita('${escaparHTML(cita.id)}')">Cancelar cita</button></div>` : ""}
    </div>`;
}

function cancelarCita(id) {
    if (!window.confirm("¿Deseas cancelar esta cita?")) return;
    const citas = obtenerCitas();
    const cita = citas.find(c => String(c.id) === String(id));
    if (!cita) return mostrarNotificacion("No se encontró la cita.", "error");
    cita.estado = "Cancelada";
    cita.fechaCancelacion = new Date().toISOString();
    if (!guardarJSON(CLAVE_CITAS, citas)) return;
    actualizarMisCitas(); actualizarEstadisticas();
    mostrarNotificacion("La cita se canceló correctamente.", "info");
}

function actualizarEstadisticas() {
    const citas = obtenerCitas();
    const usuario = obtenerUsuario();
    const citasUsuario = usuario ? citas.filter(c => c.nss === usuario.nss) : citas;
    const confirmadas = citasUsuario.filter(c => c.estado !== "Cancelada");
    const canceladas = citasUsuario.filter(c => c.estado === "Cancelada");
    const elementos = { totalCitas:citasUsuario.length, citasConfirmadas:confirmadas.length, citasCanceladas:canceladas.length };
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    });
}

function configurarFechaMinima() {
    const fecha = document.getElementById("fecha");
    if (fecha) fecha.min = fechaActualLocal();
}
function configurarValidaciones() {
    ["nss","loginNss"].forEach(id => {
        const elemento = document.getElementById(id);
        if (!elemento) return;
        elemento.maxLength = 11;
        elemento.inputMode = "numeric";
        elemento.addEventListener("input", () => elemento.value = elemento.value.replace(/\D/g, "").slice(0,11));
    });
    ["curp","loginCurp"].forEach(id => {
        const elemento = document.getElementById(id);
        if (!elemento) return;
        elemento.maxLength = 18;
        elemento.addEventListener("input", () => elemento.value = elemento.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0,18));
    });
}
function filtrarCitas(estado) {
    const lista = document.getElementById("listaCitas");
    if (!lista) return;
    const usuario = obtenerUsuario();
    let citas = obtenerCitas();
    if (usuario) citas = citas.filter(c => c.nss === usuario.nss);
    if (estado !== "Todas") citas = citas.filter(c => (c.estado || "Confirmada") === estado);
    if (!citas.length) {
        lista.innerHTML = `<div class="list-group-item text-center">No se encontraron citas para este filtro.</div>`;
        return;
    }
    lista.innerHTML = citas.map(crearTarjetaCita).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    configurarFechaMinima();
    configurarValidaciones();
    actualizarPanelUsuario();
    actualizarMisCitas();
    actualizarEstadisticas();
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") cerrarLogin();
    });
    console.info("IMSS Gestión de Citas Médicas inicializado correctamente.");
});

// ---------------------------------------------------------
// 15. DETALLE INTERACTIVO DE ESPECIALIDADES
// Los nombres y horarios son ficticios para demostración.
// ---------------------------------------------------------
const INFORMACION_ESPECIALIDADES = {
    "Medicina General": {
        descripcion: "Atención primaria, orientación preventiva y valoración inicial de síntomas comunes.",
        servicios: ["Consulta de primera vez", "Revisión general", "Orientación preventiva"],
        medico: "Dr. Alejandro Rivera (Demo)", horario: "Lunes a viernes · 08:00–14:00", unidad: "UMF No. 1 (Demo)"
    },
    "Pediatría": {
        descripcion: "Atención y seguimiento de la salud durante la infancia y adolescencia.",
        servicios: ["Valoración pediátrica", "Seguimiento de crecimiento", "Orientación preventiva"],
        medico: "Dra. Sofía Hernández (Demo)", horario: "Lunes a viernes · 09:00–13:00", unidad: "UMF No. 1 (Demo)"
    },
    "Odontología": {
        descripcion: "Revisión bucal, prevención y orientación para el cuidado dental.",
        servicios: ["Revisión dental", "Limpieza y prevención (demo)", "Orientación de higiene bucal"],
        medico: "Dr. Daniel Cruz (Demo)", horario: "Lunes a viernes · 08:00–12:00", unidad: "UMF No. 2 (Demo)"
    },
    "Cardiología": {
        descripcion: "Valoración y seguimiento de la salud cardiovascular mediante consulta especializada.",
        servicios: ["Consulta de valoración", "Seguimiento cardiovascular", "Orientación sobre factores de riesgo"],
        medico: "Dra. Valeria Morales (Demo)", horario: "Martes y jueves · 10:00–14:00", unidad: "Hospital General (Demo)"
    },
    "Ginecología": {
        descripcion: "Atención especializada para la salud ginecológica y orientación preventiva.",
        servicios: ["Consulta ginecológica", "Orientación preventiva", "Seguimiento (demo)"],
        medico: "Dra. Fernanda Castillo (Demo)", horario: "Lunes y miércoles · 09:00–13:00", unidad: "Hospital General (Demo)"
    },
    "Dermatología": {
        descripcion: "Evaluación y orientación sobre afecciones de la piel, cabello y uñas.",
        servicios: ["Valoración dermatológica", "Revisión de piel", "Orientación de cuidado"],
        medico: "Dr. Miguel Torres (Demo)", horario: "Miércoles y viernes · 10:00–14:00", unidad: "Hospital General (Demo)"
    },
    "Oftalmología": {
        descripcion: "Consulta para valorar la salud visual y detectar posibles alteraciones oculares.",
        servicios: ["Valoración visual", "Revisión ocular", "Orientación de salud visual"],
        medico: "Dra. Elena Vargas (Demo)", horario: "Martes y viernes · 08:00–12:00", unidad: "Hospital General (Demo)"
    },
    "Traumatología": {
        descripcion: "Valoración de lesiones y molestias del sistema musculoesquelético.",
        servicios: ["Consulta de valoración", "Revisión de lesiones", "Orientación de movilidad"],
        medico: "Dr. Roberto Sánchez (Demo)", horario: "Lunes a jueves · 11:00–15:00", unidad: "Hospital General (Demo)"
    }
};

function seleccionarEspecialidad(nombre) {
    const info = INFORMACION_ESPECIALIDADES[nombre];
    if (!info) return;
    const panel = document.getElementById("especialidadDetalle");
    if (!panel) return;
    document.querySelectorAll(".service-select").forEach(card => card.classList.remove("selected"));
    const tarjetas = [...document.querySelectorAll(".service-select")];
    tarjetas.find(card => card.textContent.includes(nombre))?.classList.add("selected");
    document.getElementById("detalleNombre").textContent = nombre;
    document.getElementById("detalleDescripcion").textContent = info.descripcion;
    document.getElementById("detalleServicios").innerHTML = info.servicios.map(servicio => `<li>${escaparHTML(servicio)}</li>`).join("");
    document.getElementById("doctorNombre").textContent = info.medico;
    document.getElementById("doctorEspecialidad").textContent = nombre;
    document.getElementById("doctorHorario").textContent = info.horario;
    document.getElementById("doctorUnidad").textContent = info.unidad;
    const selector = document.getElementById("especialidad");
    if (selector) selector.value = nombre;
    const medico = document.getElementById("medico");
    if (medico) {
        const opcion = [...medico.options].find(o => o.value === info.medico || o.text === info.medico);
        if (opcion) medico.value = opcion.value;
        else {
            const nueva = new Option(info.medico, info.medico);
            medico.add(nueva);
            medico.value = info.medico;
        }
    }
    panel.classList.remove("hidden");
    panel.scrollIntoView({behavior:"smooth", block:"nearest"});
}
