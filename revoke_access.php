<?php
session_start();
include "config.php";
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Please login first"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Delete accepted requests where current user is sender
$sql = "DELETE FROM diary_requests WHERE sender_id=? AND status='accepted'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => "Access revoked successfully"]);
} else {
    echo json_encode(["error" => "Failed to revoke access"]);
}
?>