<?php
// Verificar si el formulario fue enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recuperar el correo electrónico proporcionado en el formulario
    $email_to = $_POST['email'];
    
    // Generar un código de verificación único
    $verification_code = md5(uniqid(rand(), true));

    // Configurar el correo electrónico
    $subject = "Recuperación de Contraseña";
    $message = "Hola,\n\n";
    $message .= "Hemos recibido una solicitud para recuperar tu contraseña.\n\n";
    $message .= "Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:\n";
    $message .= "http://tu_sitio_web.com/reset_password.php?email=" . $email_to . "&code=" . $verification_code . "\n\n";
    $message .= "Si no solicitaste esta recuperación, puedes ignorar este mensaje.\n\n";
    $message .= "Gracias,\n";
    $message .= "Equipo de Soporte";

    // Configurar el remitente
    $headers = "From: tu_correo@tu_sitio_web.com";

    // Enviar el correo electrónico
    if (mail($email_to, $subject, $message, $headers)) {
        echo "Se ha enviado un correo de verificación a tu dirección de correo electrónico. Por favor, revisa tu bandeja de entrada.";
    } else {
        echo "Ha ocurrido un error al enviar el correo electrónico. Por favor, inténtalo de nuevo más tarde.";
    }
}
?>
