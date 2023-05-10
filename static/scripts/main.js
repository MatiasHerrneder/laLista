function cargarTareaNormal(){
    const nombre = document.getElementById("TNnombre")
    const descripcion = document.getElementById("TNdescripcion")
    const fechaCulminacion = document.getElementById("TNfechaCulminacion")
    fetch("/insert-tarea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre.value,
            descripcion: descripcion.value,
            fechaDeCulminacion: fechaCulminacion.value
        })
    })
    .then(res => res.json())
    .then(response => {
        alert("Mostrar que se cargo, validar")
    })
    .catch(error => {
        console.error(error)
        alert("Error en el servidor")
        });
}

function cargarTareaCustom(){
    const nombre = document.getElementById("TCnombre")
    const descripcion = document.getElementById("TCdescripcion")
    const fechaPropuesta = document.getElementById("TCfechaPropuesta")
    const fechaCulminacion = document.getElementById("TCfechaCulminacion")
    fetch("/insert-tarea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre.value,
            descripcion: descripcion.value,
            estado: document.querySelector('input[name="estado"]:checked').value,
            fechaDePropuesta: fechaPropuesta.value,
            fechaDeCulminacion: fechaCulminacion.value
        })
    })
    .then(res => res.json())
    .then(response => {
        alert("Mostrar que se cargo, validar")
    })
    .catch(error => {
        console.error(error)
        alert("Error en el servidor")
        });
}

function cargarTareaScheduler(){
    const nombre = document.getElementById("CSnombre")
    const descripcion = document.getElementById("CSdescripcion")
    const fechaPrimerTarea = document.getElementById("CSfechaPrimerTarea")
    const unidadRepetirCada = document.getElementById("CSunidadRepetirCada")
    const repetirCada = document.getElementById("CSrepetirCada")
    const unidadPlazo = document.getElementById("CSunidadPlazo")
    const plazo = document.getElementById("CSplazo")
    fetch("/insert-tareaRepetitiva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre.value,
            descripcion: descripcion.value,
            fechaDePrimerTarea: fechaPrimerTarea.value,
            unidadRepetirCada: unidadRepetirCada.value,
            repetirCada: repetirCada.options[repetirCada.selectedIndex].value,
            unidadPlazo: unidadPlazo.value,
            plazo: plazo.options[plazo.selectedIndex].value
        })
    })
    .then(res => res.json())
    .then(response => {
        alert("Mostrar que se cargo, validar")
    })
    .catch(error => {
        console.error(error)
        alert("Error en el servidor")
        });
}

const btnPestaña = document.getElementsByClassName("botonPestaña")
const pestCarga = document.getElementsByClassName("pestañaCarga")
function cambiarPestaña(pest) {
    for (let i = 0; i < btnPestaña.length; i++){
        btnPestaña[i].classList.remove("botonPestañaActivo")
        pestCarga[i].classList.add("esconder")
    }
    btnPestaña[pest].classList.add("botonPestañaActivo")
    pestCarga[pest].classList.remove("esconder")
}


const inputTextareas = document.getElementsByClassName("inputDescripcion")
for (let i = 0; i < inputTextareas.length; i++) {
    inputTextareas[i].addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
        event.preventDefault();
    }
});
}


let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0');
let yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

const ponerEnHoy = document.getElementsByClassName('fechaHoy')
for (let i = 0; i < ponerEnHoy.length; i++) {
    ponerEnHoy[i].value = today
}

const dateInput = document.getElementById("TNfechaCulminacion")
const spanOutput = document.getElementById("plazoTiempoReal")
function fechaUpdate() {
    const date1 = new Date(today)
    const date2 = new Date(dateInput.value)
    const differenceInMilliseconds = date2 - date1
    const differenceInDays = differenceInMilliseconds / 86400000
    res = ''
    if (differenceInDays >= 0){
        res = '(Plazo: '
        if (differenceInDays <= 31) res += 'Corto)'
        else if (differenceInDays <= 365) res += 'Mediano)'
        else if (differenceInDays > 365) res += 'Largo)'
    }
    if (res === '') spanOutput.innerHTML = '¡Fecha no valida!'
    else spanOutput.innerHTML = res
}



/* Tratando de hacer el plazo dinamico */ /*
dateDiff2(today, '1212-12-12')

function parsearFecha(string) {
    return {año : string.slice(0, 4), mes : string.slice(5, 7), dia : string.slice(8, 10)}
}

function dateDiff2(fechaBase = today, fechaTope) {
    //formato yyyy-mm-dd
    fechaBase = parsearFecha(fechaBase)
    fechaTope = parsearFecha(fechaTope)
    if (fechaTope.año > fechaBase.año || fechaTope.año === fechaBase.año && fechaTope.mes > fechaBase.mes || fechaTope.año === fechaBase.año && fechaTope.mes === fechaBase.mes && fechaTope.dia > fechaBase.dia){

    }
}

function dateDiff(startingDate, endingDate) {
    let startDate = new Date(new Date(startingDate).toISOString().substr(0, 10));
    if (!endingDate) {
      endingDate = new Date().toISOString().substr(0, 10); // need date in YYYY-MM-DD format
    }
    let endDate = new Date(endingDate);
    if (startDate > endDate) {
      const swap = startDate;
      startDate = endDate;
      endDate = swap;
    }
    const startYear = startDate.getFullYear();
    const february = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0 ? 29 : 28;
    const daysInMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
    let yearDiff = endDate.getFullYear() - startYear;
    let monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    let dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += daysInMonth[startDate.getMonth()];
    }
  
    return [yearDiff, monthDiff, dayDiff]
}

const dateInput = document.getElementById("fechaCulminacion")
const spanOutput = document.getElementById("plazoTiempoReal")
dateInput.onchange = function fechaUpdate() {
    //const today = new Date()
    //const otherDate = new Date(dateInput.value)
    
    let result = ''
    if (dateInput.value > today) {  
        console.log(dateInput.value)
        console.log(today)
        res = dateDiff(dateInput.value, today)

        // const years = otherDate.getFullYear() - today.getFullYear()
        // const months = otherDate.getMonth() - today.getMonth()
        // const days = otherDate.getDate() - today.getDate() + 1

        const years = res[0]
        const months = res[1]
        const days = res[2]

        console.log(years)
        console.log(months)
        console.log(days)
        console.log('-----------------------------')

        let adelante = false
        if (years >= 0 && months >= 0){
            if (days > 0) {
                if (days > 1) result += days + ' Dias'
                else result += days + ' Dia'
                adelante = true
            } 
            if (months > 0) {
                if (adelante) result += ', '
                if (months > 1) result += months + ' Meses'
                else result += months + ' Mes'
                adelante = true
            }
        }
        if (years > 0) {
            if (adelante) result += ', '
            if (years > 1) result += years + ' Años, '
            else result += years + ' Año, '
        }
        plazoTiempoRealContainer.style.display = 'inline'
    }
    else plazoTiempoRealContainer.style.display = 'none'
    spanOutput.innerHTML = result
}
*/


// fetch('/test')
//       .then(function (response) {
//           return response.json();
//       }).then(function (text) {
//           console.log('GET response:');
//           console.log(text.greeting); 
//       });


// const triggers = document.querySelectorAll('.popup-trigger');
// const popup = document.getElementById('popup');

// triggers.forEach(trigger => {
//   trigger.addEventListener('mouseenter', () => {
//     const rect = trigger.getBoundingClientRect();
//     popup.style.left = `${rect.left + window.scrollX}px`;
//     popup.style.top = `${rect.top + window.scrollY}px`;
//     popup.style.display = 'block';
//   });

//   trigger.addEventListener('mouseleave', () => {
//     popup.style.display = 'none';
//   });
// });

const popupTarea = document.getElementsByClassName('popupTarea')[0]
const popupNombre = document.getElementById('popupNombre')
const popupDescripcion = document.getElementById('popupDescripcion')
const popupEstado = document.getElementById('popupEstado')
const popupFechaDePropuesta = document.getElementById('popupFechaDePropuesta')
const popupFechaDeCulminacion = document.getElementById('popupFechaDeCulminacion')
const popupDiasRestantes = document.getElementById('popupDiasRestantes')
const popupPlazo = document.getElementById('popupPlazo')
const popupRestantesAtraso = document.getElementById('popupRestantesAtraso')
const popupBotonesIniciales = document.getElementById('popupBotonesIniciales')
const popupBotonesEditar = document.getElementById('popupBotonesEditar')

// document.addEventListener("click", function(event) {
//     if (!popupTarea.contains(event.target)) {
//         hideMenuTarea();
//     }
// });

let mouseDownOutside = true;

document.addEventListener("mousedown", function(event) {
    if (popupBotonesIniciales.style.display == 'inline') {
        if (!popupTarea.contains(event.target) && popupBorrarContainer.style.display == 'none') {
            mouseDownOutside = true;
        } else {
            mouseDownOutside = false;
        }
    }
});

document.addEventListener("mouseup", function(event) {
    if (popupBotonesIniciales.style.display == 'inline') {
        if (mouseDownOutside && !popupTarea.contains(event.target) && popupBorrarContainer.style.display == 'none') {
            hideMenuTarea();
        }
    }
});

function hideMenuTarea() {
    popupTareaContainer.style.display = 'none'
    document.body.style.overflow = "auto";
    // enableScrolling()
}

function menuTarea(call){
    try{
        value = call.id
        popupTarea.id = value
        fetch("/api/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({value})
        })
        .then(res => res.json())
        .then(response => {
            response = response[0]
            popupBotonesIniciales.style.display = 'inline'
            popupBorrarContainer.style.display = 'none'  //para que ande bien el tema de clickear afuera de la tarea
            popupBotonesEditar.style.display = 'none'
            popupTareaContainer.style.display = 'block'
            document.body.style.overflow = "hidden"
            popupDiasRestantesContainer.style.display = 'block'
            popupPlazoContainer.style.display = 'block'
            // document.body.style.overflow = "scroll"
            // document.body.style.position = "fixed"
            //disableScrolling()
            popupNombre.innerHTML = response[0]
            popupDescripcion.innerHTML = response[1]
            popupEstado.innerHTML = response[2]
            popupFechaDePropuesta.innerHTML = response[3]
            popupFechaDeCulminacion.innerHTML = response[4]
            popupDiasRestantes.innerHTML = Math.abs(response[5])
            popupPlazo.innerHTML = response[6]
            popupRestantesAtraso.innerHTML = (response[6] >= 0) ? 'Dias Restantes: ' : "Dias de Atraso: "
        })
        .catch(error => {
            console.error(error)
            alert("Error en el servidor")
            });
    }
    catch{
        alert("Error en el ID de la tarea")
    }
}

function menuTareaEditar(){
    popupDescripcion.innerHTML = '<input id="popupEdDescripcion" type="textarea" value="' + popupDescripcion.innerHTML + '"></input>'
    //popupEstado.innerHTML = '<input id="popupEdEstado" type="text" value="' + popupEstado.innerHTML + '"></input>'
    switch (popupEstado.innerHTML){
        case 'Alcanzado':
            popupEstado.innerHTML = '<input type="radio" name="popEst" value="Alcanzado" checked> Alcanzado <input type="radio" name="popEst" value="En Proceso"> En Proceso <input type="radio" name="popEst" value="No Alcanzado"> No Alcanzado'
            break
        case 'En Proceso':
            popupEstado.innerHTML = '<input type="radio" name="popEst" value="Alcanzado"> Alcanzado <input type="radio" name="popEst" value="En Proceso" checked> En Proceso <input type="radio" name="popEst" value="No Alcanzado"> No Alcanzado'
            break
        default:
            popupEstado.innerHTML = '<input type="radio" name="popEst" value="Alcanzado"> Alcanzado <input type="radio" name="popEst" value="En Proceso"> En Proceso <input type="radio" name="popEst" value="No Alcanzado" checked> No Alcanzado'
    }
    //popupFechaDePropuesta.innerHTML = '<input id="popupEdFechaDePropuesta" type="date" value="' + popupFechaDePropuesta.innerHTML.replace(new RegExp("/", "g"), "-") + '"></input>'
    //popupFechaDeCulminacion.innerHTML = '<input id="popupEdFechaDeCulminacion" type="date" value="' + popupFechaDeCulminacion.innerHTML.replace(new RegExp("/", "g"), "-") + '"></input>'
    popupFechaDePropuesta.innerHTML = '<input id="popupEdFechaDePropuesta" type="date" value="' + new Date(popupFechaDePropuesta.innerHTML.split("/").reverse().join("-")).toISOString().slice(0, 10) + '"></input>'
    popupFechaDeCulminacion.innerHTML = '<input id="popupEdFechaDeCulminacion" type="date" value="' + new Date(popupFechaDeCulminacion.innerHTML.split("/").reverse().join("-")).toISOString().slice(0, 10) + '"></input>'
///////    popupDiasRestantes.innerHTML = '<input id="popupEdDiasRestantes" type="text" value="' + popupDiasRestantes.innerHTML + '"></input>'
////    popupPlazo.innerHTML = '<input id="popupEdPlazo" type="text" value="' + popupPlazo.innerHTML + '"></input>'
    popupDiasRestantesContainer.style.display = 'none'
    popupPlazoContainer.style.display = 'none'
    popupBotonesIniciales.style.display = 'none'
    popupBotonesEditar.style.display = 'inline'
}

function valorRadio(nombre){
    //asume al menos 1 clickeado
    let elem = document.getElementsByName(nombre);  
    let i = 0
    while (!elem[i].checked){i++}
    return elem[i].value
}

function menuTareaEditarAceptar(){
    fetch('/update-tarea', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: popupTarea.id,
            descripcion: popupEdDescripcion.value,
            //estado: popupEdEstado.innerHTML,
            estado: valorRadio('popEst'),
            fechaDePropuesta: popupEdFechaDePropuesta.value,
            fechaDeCulminacion: popupEdFechaDeCulminacion.value
        })
      })
      .then(response => response.json())
      .then(data => {
        popupMensaje.style.display = 'block'
        popupMensajeEdit.innerHTML = 'La tarea fue actualizada'
    })
    .catch(error => {
        alert('Error en el servidor')
    })
}

function menuTareaEditarCancelar(){
    menuTarea(popupTarea)
}

function menuTareaBorrar(){
    popupBorrarContainer.style.display = 'block'
}

function menuTareaBorrarCancelar(){
    popupBorrarContainer.style.display = 'none'
}

function menuTareaBorrarAceptar(){
    fetch('/delete/' + popupTarea.id, {
        method: 'DELETE'
    })
    .then(response => response.text())
    .then(data => {
        console.log(data)
        popupBorrarContainer.style.display = 'none'
        popupMensaje.style.display = 'block'
        popupMensajeEdit.innerHTML = 'La tarea fue eliminada'
    })
    .catch(error => console.error(error));
}

function recargarPagina(){
    location.reload()
}


// function disableScrolling() {
//     document.body.classList.add("disable-scrolling");
//   }
  
//   function enableScrolling() {
//     document.body.classList.remove("disable-scrolling");
//   }