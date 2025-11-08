<?php
require 'db_connect.php'; 

$dia = $_GET['dia'] ?? '';
$hora = $_GET['hora'] ?? ''; 

$disponibles = [];

if ($dia && $hora) {
    $hora_completa = $hora . ":00";
    
    // Consulta JOIN para encontrar profesores LIBRES en el día y hora
    $sql = "SELECT p.nombre 
            FROM profesores p 
            JOIN horarios h ON p.id = h.profesor_id 
            WHERE h.dia = ? AND h.hora_inicio = ? AND h.estado = 'Libre'";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $dia, $hora_completa); // 'ss' = dos strings

    $stmt->execute();
    $result = $stmt->get_result();

    while($row = $result->fetch_assoc()) {
        $disponibles[] = $row;
    }
    
    $stmt->close();
}

echo json_encode($disponibles);

$conn->close();
?>