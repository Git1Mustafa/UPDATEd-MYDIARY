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

$request_id = $_POST['id'] ?? null;
$action = $_POST['action'] ?? null;

error_log("DEBUG - Request ID: $request_id, Action: $action, User ID: " . $_SESSION['user_id']);

if (!$request_id || !$action) {
    echo json_encode(["error" => "Missing request ID or action"]);
    exit;
}

if ($action === 'accept') {
    $sql = "UPDATE diary_requests SET status='accepted' WHERE id=?";
} else if ($action === 'reject') {
    $sql = "UPDATE diary_requests SET status='rejected' WHERE id=?";
} else {
    echo json_encode(["error" => "Invalid action"]);
    exit;
}

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $request_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        error_log("DEBUG - Request $request_id updated to $action");
        echo json_encode(["success" => "Request $action successfully"]);
    } else {
        error_log("DEBUG - No rows affected for request $request_id");
        echo json_encode(["error" => "Request not found or already processed"]);
    }
} else {
    error_log("DEBUG - Update failed: " . $stmt->error);
    echo json_encode(["error" => "Failed to update request: " . $stmt->error]);
}
?>