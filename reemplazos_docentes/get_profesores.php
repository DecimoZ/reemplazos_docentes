<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require 'db_connect.php'; 
// ... el resto del código ...
require 'db_connect.php'; 

$profesores = [];

// Consulta: Debe coincidir exactamente con el nombre de tu tabla y columnas
$sql = "SELECT id, nombre FROM profesores ORDER BY nombre ASC";
$result = $conn->query($sql);

if ($result) {
    // fetch_assoc() devuelve NULL si no hay más filas, terminando el while
    while($row = $result->fetch_assoc()) {
        $profesores[] = $row;
    }
} 
// Si $result es FALSE (ej: la tabla no existe), $profesores será un array vacío: []

// Devuelve el array (vacío o con datos) como JSON
echo json_encode($profesores);

$conn->close();
?>