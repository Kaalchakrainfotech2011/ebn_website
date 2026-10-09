<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Allow from any origin (if needed)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get raw POST data
    $data = json_decode(file_get_contents("php://input"));

    // If not JSON, check standard POST fields
    $name = !empty($data->name) ? $data->name : ($_POST['name'] ?? '');
    $email = !empty($data->email) ? $data->email : ($_POST['email'] ?? '');
    $message = !empty($data->message) ? $data->message : ($_POST['message'] ?? '');

    // Also support Guest form fields if they submit to the same endpoint
    $business = !empty($data->business) ? $data->business : ($_POST['business'] ?? '');
    $city = !empty($data->city) ? $data->city : ($_POST['city'] ?? '');
    $type = !empty($data->type) ? $data->type : ($_POST['type'] ?? 'Contact');

    if (empty($name) || empty($email)) {
        echo json_encode(["status" => "error", "message" => "Name and Email are required."]);
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.hostinger.com'; // Change this if your host is different
        $mail->SMTPAuth = true;
        $mail->Username = 'info@ebnworld.com';
        $mail->Password = '#vR!x@4819';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Capture debug logging to a variable to return in JSON
        $debugLog = "";
        $mail->SMTPDebug = 3;
        $mail->Debugoutput = function($str, $level) use (&$debugLog) {
            $debugLog .= $str . "\n";
        };

        // --- 1. Send data to admin ---
        $mail->setFrom('info@ebnworld.com', 'EBN Website');
        $mail->addAddress('info@ebnworld.com', 'Admin');
        $mail->addReplyTo($email, $name);

        $mail->isHTML(true);
        $mail->Subject = "New $type Form Submission from $name";

        $mail->SMTPKeepAlive = true; // Keep connection open for the second email

        $body = "<h3>New $type Form Submission</h3>";
        $body .= "<p><strong>Name:</strong> $name</p>";
        $body .= "<p><strong>Email:</strong> $email</p>";
        if (!empty($business)) {
            $body .= "<p><strong>Business:</strong> $business</p>";
        }
        if (!empty($city)) {
            $body .= "<p><strong>City:</strong> $city</p>";
        }
        if (!empty($message)) {
            $body .= "<p><strong>Message:</strong><br/>$message</p>";
        }

        $mail->Body = $body;
        $mail->send();

        // --- 2. Send Thank You email to user ---
        $mail->clearAllRecipients();
        $mail->clearReplyTos();

        $mail->setFrom('info@ebnworld.com', 'Elite Business Network');
        $mail->addAddress($email, $name);

        $mail->Subject = "Thank You for Contacting Elite Business Network";

        $userBody = "<h3>Dear $name,</h3>";
        $userBody .= "<p>Thank you for reaching out to Elite Business Network (EBN). We have received your information.</p>";
        $userBody .= "<p>Our team will review your message and get back to you within 1 business day.</p>";
        $userBody .= "<p>Best regards,<br/>The EBN Team<br/>info@ebnworld.com</p>";

        $mail->Body = $userBody;
        $mail->send();

        $mail->smtpClose(); // Close the connection after sending both emails

        echo json_encode(["status" => "success", "message" => "Message sent successfully!", "debug" => $debugLog]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}", "debug" => $debugLog]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
