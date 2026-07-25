<?php
// Simple Mail Test Script for Hostinger
require 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

echo "<h2>SMTP Connection Test</h2>";
echo "<pre>";

$mail = new PHPMailer(true);

try {
    // Enable verbose debug output directly to the browser
    $mail->SMTPDebug = 3;
    $mail->Debugoutput = 'html';

    // Server settings
    $mail->isSMTP();
    $mail->Host = 'smtp.hostinger.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'info@ebnworld.com';
    $mail->Password = '#vR!x@4819';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Recipients
    $mail->setFrom('info@ebnworld.com', 'EBN Website');
    $mail->addAddress('info@ebnworld.com', 'Admin Test');

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Hostinger SMTP Test';
    $mail->Body = 'This is a test email to verify SMTP configuration.';

    $mail->send();
    echo "\n\n<b>SUCCESS: Test email has been sent!</b>\n";
} catch (Exception $e) {
    echo "\n\n<b>FAILURE: Message could not be sent. Mailer Error: {$mail->ErrorInfo}</b>\n";
}
echo "</pre>";
?>