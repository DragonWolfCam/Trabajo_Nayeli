<?php
// Conectar a la base de datos
$host = 'localhost'; // Cambia esto según tu configuración
$db = 'empleadosDB';
$user = 'root'; // Cambia esto según tu configuración
$pass = ''; // Cambia esto según tu configuración

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(['mensaje' => "Conexión fallida: " . $conn->connect_error]));
}

// Obtener el código QR del empleado
$codigoQR = $_POST['codigoQR'];

if (!$codigoQR) {
    die(json_encode(['mensaje' => 'Código QR no proporcionado.']));
}

// Buscar al empleado en la base de datos
$empleadoQuery = $conn->prepare("SELECT id FROM empleados WHERE codigo_qr = ?");
$empleadoQuery->bind_param('s', $codigoQR);
$empleadoQuery->execute();
$empleadoResult = $empleadoQuery->get_result();

if ($empleadoResult->num_rows > 0) {
    $empleado = $empleadoResult->fetch_assoc();
    $empleado_id = $empleado['id'];

    // Obtener la fecha actual
    $fecha_registro = date('Y-m-d');

    // Verificar si el empleado ya tiene una entrada registrada hoy
    $registroQuery = $conn->prepare("SELECT * FROM registros WHERE empleado_id = ? AND fecha_registro = ?");
    $registroQuery->bind_param('is', $empleado_id, $fecha_registro);
    $registroQuery->execute();
    $registroResult = $registroQuery->get_result();

    if ($registroResult->num_rows > 0) {
        // El empleado ya tiene una entrada registrada hoy, así que registramos la salida
        $updateQuery = $conn->prepare("UPDATE registros SET hora_salida = NOW() WHERE empleado_id = ? AND fecha_registro = ?");
        $updateQuery->bind_param('is', $empleado_id, $fecha_registro);
        $updateQuery->execute();
        echo json_encode(['mensaje' => 'Hora de salida registrada.']);
    } else {
        // El empleado no tiene una entrada registrada hoy, así que registramos la entrada
        $insertQuery = $conn->prepare("INSERT INTO registros (empleado_id, fecha_registro, hora_entrada) VALUES (?, ?, NOW())");
        $insertQuery->bind_param('is', $empleado_id, $fecha_registro);
        $insertQuery->execute();
        echo json_encode(['mensaje' => 'Hora de entrada registrada.']);
    }
} else {
    echo json_encode(['mensaje' => 'Empleado no encontrado.']);
}
$conn->close();
?>
