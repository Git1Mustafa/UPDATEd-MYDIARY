<?php
session_start();
include "config.php";

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];
// find partner_id from users table
$sql = "SELECT partner_id FROM users WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

$partner_id = $result['partner_id'] ?? null;

if (!$partner_id) {
    echo json_encode(["error" => "No partner linked"]);
    exit;
}

// check if request accepted
$sql = "SELECT status FROM diary_requests 
        WHERE sender_id=? AND receiver_id=? AND status='accepted'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $user_id, $partner_id);
$stmt->execute();
$request = $stmt->get_result()->fetch_assoc();

if (!$request) {
    echo json_encode(["error" => "Partner has not accepted your request yet"]);
    exit;
}

// ✅ now fetch partner's diary
$sql = "SELECT * FROM diary_entries WHERE user_id=? ORDER BY date DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $partner_id);
$stmt->execute();
$result = $stmt->get_result();

$entries = [];
while ($row = $result->fetch_assoc()) {
    $entries[] = $row;
}

echo json_encode($entries);
?>