<?php
session_start();
include "config.php";
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Please login first"]);
    exit;
}

$current_user = $_SESSION['user_id'];
$partnerUsername = $_POST['partner_username'] ?? null;

if (!$partnerUsername) {
    echo json_encode(["error" => "No partner username provided"]);
    exit;
}
//debug code
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Session missing. Please login first."]);
    exit;
} else {
    // Debug
    file_put_contents("debug.log", "Session User ID: " . $_SESSION['user_id'] . "\n", FILE_APPEND);
}

// 🔹 Find partner by username
$sql = "SELECT id FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $partnerUsername);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["error" => "Partner username not found"]);
    exit;
}

$partner = $res->fetch_assoc();
$partner_id = $partner['id'];

// 🔹 Update both users to link as partners
$sql = "UPDATE users SET partner_id = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $partner_id, $current_user);
$stmt->execute();

// 🔹 Also update the partner (optional: only if you want 2-way link)
$sql = "UPDATE users SET partner_id = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $current_user, $partner_id);
$stmt->execute();

echo json_encode(["success" => "Partner linked successfully!"]);