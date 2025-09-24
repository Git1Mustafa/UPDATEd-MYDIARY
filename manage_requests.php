<?php
session_start();
include "config.php";
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get incoming requests (where current user is receiver)
$sql = "SELECT r.id, r.sender_id AS from_id, u.username AS `from`, r.status, r.created_at
        FROM diary_requests r
        JOIN users u ON r.sender_id = u.id
        WHERE r.receiver_id=? AND r.status='pending'
        ORDER BY r.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$incoming = [];
while ($row = $result->fetch_assoc()) {
    $incoming[] = $row;
}

echo json_encode(["incoming" => $incoming]);
?>
