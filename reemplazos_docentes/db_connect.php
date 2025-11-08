<?php
// (Opcional: Añadir las líneas de error aquí si aún las tienes)
// ini_set('display_errors', 1);
// error_reporting(E_ALL);

// ===================================
// LÍNEA 5: DEFINICIÓN DE VARIABLES
// ESTAS DEBEN IR PRIMERO
// ===================================
$servername = "localhost";
$username = "root";  
$password = "";      
$dbname = "reemplazo1"; // El nombre de tu base de datos

// Establecer el encabezado
header('Content-Type: application/json; charset=utf-8');

// ===================================
// CREAR CONEXIÓN (usa las variables definidas arriba)
// ===================================
$conn = new mysqli($servername, $username, $password, $dbname);

// 1. Verificar la conexión
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Connection Failed: ' . $conn->connect_error]);
    die();
}

// ... Resto del código ...
$conn->set_charset("utf8");

// **IMPORTANTE:** Borra el 'echo "CONEXIÓN EXITOSA..."' que usamos para depurar
// O el script get_profesores.php fallará con JSON inválido.

?>