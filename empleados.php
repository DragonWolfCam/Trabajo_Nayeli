<?php
$host = 'localhost'; // Cambia esto según tu configuración
$db = 'empleadosDB';
$user = 'root'; // Cambia esto según tu configuración
$pass = ''; // Cambia esto según tu configuración

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

$data = json_decode(file_get_contents('php://input'), true);
$codigoQR = $data['codigoQR'];

if (!$codigoQR) {
    echo json_encode(['mensaje' => 'Código QR no proporcionado.']);
    exit;
}

$empleadoQuery = $conn->prepare("SELECT id FROM empleados WHERE codigo_qr = ?");
$empleadoQuery->bind_param('s', $codigoQR);
$empleadoQuery->execute();
$empleadoResult = $empleadoQuery->get_result();

if ($empleadoResult->num_rows > 0) {
    $empleado = $empleadoResult->fetch_assoc();
    $empleado_id = $empleado['id'];

    $registroQuery = $conn->prepare("SELECT * FROM registros WHERE empleado_id = ? AND hora_salida IS NULL");
    $registroQuery->bind_param('i', $empleado_id);
    $registroQuery->execute();
    $registroResult = $registroQuery->get_result();

    if ($registroResult->num_rows > 0) {
        // Registrar la hora de salida
        $updateQuery = $conn->prepare("UPDATE registros SET hora_salida = NOW() WHERE empleado_id = ? AND hora_salida IS NULL");
        $updateQuery->bind_param('i', $empleado_id);
        $updateQuery->execute();
        echo json_encode(['mensaje' => 'Hora de salida registrada.']);
    } else {
        // Registrar la hora de entrada
        $insertQuery = $conn->prepare("INSERT INTO registros (empleado_id, hora_entrada) VALUES (?, NOW())");
        $insertQuery->bind_param('i', $empleado_id);
        $insertQuery->execute();
        echo json_encode(['mensaje' => 'Hora de entrada registrada.']);
    }
} else {
    echo json_encode(['mensaje' => 'Empleado no encontrado.']);
}

$conn->close();
?>
