/*__TEMPORIZADOR__*/
const temporizador = document.getElementById('temporizador');
const btnIniciar = document.getElementById('btnIniciar');
const setCounter = document.querySelector('.set-counter');
const icono = btnIniciar.querySelector('i');
const alarma = document.getElementById('alarmaAudio');

let tiempo = 25 * 60;
let enDescanso = false;
let sets = 0;
let intervalo = null;
let enPausa = true;

function actualizarTemporizador() {
  const minutos = Math.floor(tiempo / 60);
  const segundos = tiempo % 60;
  const formato = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  temporizador.textContent = formato;
  document.title = `Pomodoro | ${formato}`;
}

function notificarCambioDeFase() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      alarma.currentTime = 0;
      alarma.play().catch(() => {}); 
    }, i * 1500);
  }

  if (navigator.vibrate) {
    navigator.vibrate([300, 200, 300, 200, 300]);
  }
}

function iniciarTemporizador() {
  if (intervalo) return;

  tiempo--;
  actualizarTemporizador();

  intervalo = setInterval(() => {
    tiempo--;
    actualizarTemporizador();

    if (tiempo <= 0) {
      clearInterval(intervalo);
      intervalo = null;

      notificarCambioDeFase();

      if (!enDescanso) {
        tiempo = 5 * 60;
        enDescanso = true;
        guardarSet(); 
      } else {
        tiempo = 25 * 60;
        enDescanso = false;
        sets++;
        setCounter.textContent = `Set ${sets}`;
      }

      actualizarTemporizador();
      iniciarTemporizador();
    }
  }, 1000);
}

function alternarTemporizador() {
  if (intervalo) {
    clearInterval(intervalo);
    intervalo = null;
    icono.classList.remove('fa-pause');
    icono.classList.add('fa-play');
    enPausa = true;
  } else {
    icono.classList.remove('fa-play');
    icono.classList.add('fa-pause');
    enPausa = false;
    iniciarTemporizador();
  }
}

btnIniciar.addEventListener('click', alternarTemporizador);
actualizarTemporizador();
/*________________*/











/*__CALENDARIO__*/
function renderizarCalendario() {
  const diasContenedor = document.getElementById("dias-del-mes");
  const fechaActual = document.getElementById("fecha-actual");
  const hoy = new Date();

  const fechaStr = hoy.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  fechaActual.textContent = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);

  const año = hoy.getFullYear();
  const mes = hoy.getMonth();

  const primerDiaMes = new Date(año, mes, 1);
  const ultimoDiaMes = new Date(año, mes + 1, 0);

  const inicioSemana = primerDiaMes.getDay();
  const totalDias = ultimoDiaMes.getDate();

  diasContenedor.innerHTML = "";

  for (let i = 0; i < inicioSemana; i++) {
    diasContenedor.innerHTML += `<div></div>`;
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const fecha = new Date(año, mes, dia);
    const claseFinde = (fecha.getDay() === 0 || fecha.getDay() === 6) ? "finde" : "";
    const claseHoy =
      dia === hoy.getDate() &&
      mes === hoy.getMonth() &&
      año === hoy.getFullYear()
        ? "hoy"
        : "";

    diasContenedor.innerHTML += `<div class="${claseHoy} ${claseFinde}">${dia}</div>`;
  }
}

renderizarCalendario();
/*________________*/











/*__ESTADÍSTICAS__*/

function guardarSet() {
  const hoy = new Date().toISOString().slice(0, 10); 
  let historial = JSON.parse(localStorage.getItem("pomodoro_historial") || "{}");

  historial[hoy] = (historial[hoy] || 0) + 1;
  localStorage.setItem("pomodoro_historial", JSON.stringify(historial));

  actualizarEstadisticas(historial);
}

function actualizarEstadisticas(historial = null) {
  if (!historial) {
    historial = JSON.parse(localStorage.getItem("pomodoro_historial") || "{}");
  }

  let totalSets = 0;
  let setsUltimaSemana = 0;

  const hoy = new Date();
  const hace7dias = new Date();
  hace7dias.setDate(hoy.getDate() - 6);

  for (let fecha in historial) {
    const fechaObj = new Date(fecha);
    totalSets += historial[fecha];

    if (fechaObj >= hace7dias && fechaObj <= hoy) {
      setsUltimaSemana += historial[fecha];
    }
  }

  const horasTotales = (totalSets * 25) / 60;
  const horasSemanales = (setsUltimaSemana * 25) / 60;
  const promedioDiario = horasSemanales / 7;

  document.getElementById("horasTotales").textContent = `${Math.floor(horasTotales)} h`;
  document.getElementById("horasSemanales").textContent = `${Math.floor(horasSemanales)} h`;
  document.getElementById("promedioDiario").textContent = `${Math.floor(promedioDiario)} h/día`;
}


actualizarEstadisticas();
/*________________*/