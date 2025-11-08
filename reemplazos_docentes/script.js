// ====================================================================
// CONFIGURACIÓN Y REFERENCIAS
// ====================================================================

// Definiciones de datos para el calendario
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const HORAS = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00"
]; 

// Obtener referencias a elementos del DOM (CRUCIAL: IDs deben coincidir con index.html)
const profesorSelect = document.getElementById('profesor-select');
const horarioBody = document.getElementById('horario-body');
const btnSearch = document.getElementById('btn-search-availability');
const searchDaySelect = document.getElementById('search-day');
const searchTimeSelect = document.getElementById('search-time');
const teachersList = document.getElementById('teachers-list');
const searchStatus = document.getElementById('search-status');


// ====================================================================
// INICIALIZACIÓN Y EVENTOS
// ====================================================================

// El script espera a que el HTML esté completamente cargado para empezar
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // 1. Dibuja la estructura base de la tabla (para que no esté vacía)
    renderBaseCalendar(); 
    
    // 2. Carga la lista de profesores desde PHP/MySQL
    cargarProfesores(); 

    // Asignación de Event Listeners una vez que los elementos existen
    if (profesorSelect) {
        profesorSelect.addEventListener('change', handleProfesorChange);
    }
    if (btnSearch) {
        btnSearch.addEventListener('click', buscarReemplazo);
    }
}

function handleProfesorChange() {
    const profesorId = profesorSelect.value;
    if (profesorId) {
        cargarHorario(profesorId);
    } else {
        // Si selecciona la opción vacía, limpia y vuelve a dibujar el calendario base
        renderBaseCalendar();
    }
}

// ====================================================================
// COMUNICACIÓN CON EL BACKEND (PHP)
// ====================================================================

/**
 * Llama a get_profesores.php y llena el selector.
 */
async function cargarProfesores() {
    try {
        // RUTA ABSOLUTA CORREGIDA: Esto debería resolver el error 404
        const url = '/reemplazos_docentes/get_profesores.php';
        const response = await fetch(url);

        // Manejo de errores (404, 500, etc.)
        if (!response.ok) { 
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const profesores = await response.json();
        
        // Limpiar y añadir la opción por defecto
        if (profesorSelect) {
            profesorSelect.innerHTML = '<option value="">--- Seleccione un Docente ---</option>';

            profesores.forEach(profesor => {
                const option = document.createElement('option');
                option.value = profesor.id;
                option.textContent = profesor.nombre;
                profesorSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error("Error cargando profesores:", error);
        // Muestra el error en la interfaz
        if (profesorSelect) {
             profesorSelect.innerHTML = `<option value="">Error: ${error.message.substring(0, 30)}...</option>`;
        }
    }
}

/**
 * Llama a get_horario.php con el ID del profesor seleccionado.
 */
async function cargarHorario(profesorId) {
    try {
        const url = `/reemplazos_docentes/get_horario.php?id=${profesorId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error al cargar el horario: ${response.status}`);

        const horarioData = await response.json();
        renderCalendar(horarioData);

    } catch (error) {
        console.error("Error cargando horario:", error);
    }
}

/**
 * Llama a buscar_disponibilidad.php con los parámetros de búsqueda.
 */
async function buscarReemplazo() {
    const dia = searchDaySelect ? searchDaySelect.value : '';
    const hora = searchTimeSelect ? searchTimeSelect.value : '';

    if (!dia || !hora) {
        searchStatus.textContent = "Por favor, seleccione día y hora.";
        return;
    }

    searchStatus.textContent = "Buscando disponibilidad...";
    teachersList.innerHTML = ''; 

    try {
        const url = `/reemplazos_docentes/buscar_disponibilidad.php?dia=${dia}&hora=${hora}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error al buscar: ${response.status}`);

        const disponibles = await response.json();

        if (disponibles.length > 0) {
            searchStatus.textContent = `✅ ${disponibles.length} profesores disponibles para ${dia} a las ${hora}.`;
            disponibles.forEach(profesor => {
                const li = document.createElement('li');
                li.textContent = profesor.nombre;
                teachersList.appendChild(li);
            });
        } else {
            searchStatus.textContent = `❌ No se encontraron profesores libres el ${dia} a las ${hora}.`;
        }

    } catch (error) {
        console.error("Error en la búsqueda:", error);
        searchStatus.textContent = "Hubo un error de conexión con el servidor.";
    }
}

// ====================================================================
// RENDERIZADO DEL CALENDARIO (MANIPULACIÓN DEL DOM)
// ====================================================================

/**
 * Crea la estructura base de la tabla (solo horas y celdas vacías).
 */
function renderBaseCalendar() {
    if (!horarioBody) return; 
    
    horarioBody.innerHTML = ''; // Limpia el contenido anterior

    HORAS.forEach(hora => {
        const row = horarioBody.insertRow();
        
        const timeCell = row.insertCell();
        timeCell.classList.add('time-cell');
        timeCell.textContent = hora;

        DIAS.forEach(dia => {
            const cell = row.insertCell();
            // ID único para referenciar la celda 
            cell.id = `cell-${dia}-${hora.replace(':', '-')}`; 
            cell.classList.add('time-slot', 'status-unknown'); 
        });
    });
}

/**
 * Pinta el calendario con los estados de horario obtenidos de la DB.
 */
function renderCalendar(horarioData) {
    renderBaseCalendar(); // Limpiar y rehacer estructura base

    // Mapear los datos para una búsqueda rápida (dia-hora -> estado)
    const horarioMap = new Map();
    horarioData.forEach(item => {
        const key = `${item.dia}-${item.hora_inicio}`; // key = Lunes-08:00
        horarioMap.set(key, item.estado);
    });

    DIAS.forEach(dia => {
        HORAS.forEach(hora => {
            const key = `${dia}-${hora}`;
            // Si no hay registro en la DB, asumimos que está Libre (estado por defecto)
            const estado = horarioMap.get(key); 
            
            const cellId = `cell-${dia}-${hora.replace(':', '-')}`;
            const cell = document.getElementById(cellId);

            if (cell) {
                cell.className = 'time-slot'; // Resetear clases
                
                // Si la DB tiene el estado 'Ocupado'
                if (estado === 'Ocupado') {
                    cell.classList.add('status-occupied');
                    cell.textContent = "OCUPADO"; 
                } else if (estado === 'Libre') {
                    // Si la DB tiene el estado 'Libre'
                    cell.classList.add('status-available');
                    cell.textContent = "LIBRE"; 
                } else {
                    // Si no hay registro en la DB, lo dejamos como 'Desconocido' o vacío.
                    cell.classList.add('status-unknown');
                    cell.textContent = ""; 
                }
            }
        });
    });
}