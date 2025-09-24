<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
include "config.php";
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Please login first"]);
    exit;
}

$sender_id = $_SESSION['user_id'];

// Get partner id
$sql = "SELECT partner_id FROM users WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $sender_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$receiver_id = $res['partner_id'] ?? null;

// DEBUG: Log the IDs
error_log("DEBUG - Sender ID: $sender_id, Receiver ID: $receiver_id");

if (!$receiver_id) {
    echo json_encode(["error" => "No partner linked"]);
    exit;
}

// Check if request already exists - BUT ONLY CHECK FOR PENDING OR ACCEPTED
// Allow new requests if previous ones were rejected
$sql = "SELECT id, status FROM diary_requests 
        WHERE sender_id=? AND receiver_id=? 
        AND status IN ('pending', 'accepted')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $sender_id, $receiver_id);
$stmt->execute();
$existing = $stmt->get_result()->fetch_assoc();

if ($existing) {
    echo json_encode(["error" => "Request already exists with status: " . $existing['status']]);
    exit;
}

// Insert new request
$sql = "INSERT INTO diary_requests (sender_id, receiver_id, status) VALUES (?, ?, 'pending')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $sender_id, $receiver_id);

if ($stmt->execute()) {
    $request_id = $conn->insert_id;
    error_log("DEBUG - Request inserted with ID: $request_id");
    echo json_encode(["success" => "Request sent to partner", "request_id" => $request_id]);
} else {
    error_log("DEBUG - Insert failed: " . $stmt->error);
    echo json_encode(["error" => "Failed to send request: " . $stmt->error]);
}
?>