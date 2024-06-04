<?php
require_once 'vendor/autoload.php'; // Reemplaza la ruta con la ubicación correcta del autoload.php de Composer

use Endroid\QrCode\QrCode;

// Función para generar el código QR y guardarlo en un archivo
function generarCodigoQR($texto, $nombreArchivo) {
    $qrCode = new QrCode($texto);
    $qrCode->setSize(300);

    // Guardar el código QR en un archivo
    $qrCode->writeFile($nombreArchivo);
}

// Array de empleados con sus nombres y códigos QR
$empleados = [
    ['nombre' => 'Luis Alfredo Camacho', 'codigo_qr' => 'qr_luis_camacho'],
    ['nombre' => 'Pedro Vergara', 'codigo_qr' => 'qr_pedro_vergara'],
    ['nombre' => 'Alejandro Jaramillo', 'codigo_qr' => 'qr_alejandro_jaramillo'],
    ['nombre' => 'Pedro Mendoza', 'codigo_qr' => 'qr_pedro_mendoza'],
    ['nombre' => 'Ana Christa Vega', 'codigo_qr' => 'qr_ana_vega']
];

// Directorio donde se guardarán los códigos QR
$directorioQR = 'qr_codes/';

// Generar y guardar los códigos QR para cada empleado
foreach ($empleados as $empleado) {
    $nombreArchivo = $directorioQR . $empleado['codigo_qr'] . '.png';
    generarCodigoQR($empleado['nombre'], $nombreArchivo);
}

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
