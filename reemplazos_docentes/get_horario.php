<?php
require 'db_connect.php'; 

$profesorId = $_GET['id'] ?? null;
$horario = [];

if ($profesorId) {
    // Usamos prepared statement para seguridad
    $sql = "SELECT dia, SUBSTRING(hora_inicio, 1, 5) AS hora_inicio, estado FROM horarios WHERE profesor_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $profesorId); // 'i' = integer
    $stmt->execute();
    $result = $stmt->get_result();

    while($row = $result->fetch_assoc()) {
        $horario[] = $row;
    }
    
    $stmt->close();
}

echo json_encode($horario);

$conn->close();
?>