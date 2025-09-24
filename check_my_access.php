<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
include "config.php";
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Please login first"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get partner id
$sql = "SELECT partner_id FROM users WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$partner_id = $res['partner_id'] ?? null;

error_log("DEBUG check_my_access - User ID: $user_id, Partner ID: $partner_id");

if (!$partner_id) {
    echo json_encode(["error" => "No partner linked", "has_access" => false]);
    exit;
}

// Check if current user has accepted request (they sent request, partner accepted)
$sql = "SELECT r.id, u.username as partner_name
        FROM diary_requests r
        JOIN users u ON r.receiver_id = u.id
        WHERE r.sender_id=? AND r.receiver_id=? AND r.status='accepted'";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $user_id, $partner_id);
$stmt->execute();
$result = $stmt->get_result();
$request_data = $result->fetch_assoc();

error_log("DEBUG check_my_access - Request found: " . ($request_data ? "YES" : "NO"));

if (!$request_data) {
    echo json_encode(["has_access" => false]);
    exit;
}

// Set timezone to India (adjust if you're in a different timezone)
date_default_timezone_set('Asia/Kolkata');
$today = date('Y-m-d'); // Get today's date in YYYY-MM-DD format

error_log("DEBUG check_my_access - Today's date: $today");

// First, let's see ALL entries to debug
$sql_debug = "SELECT id, entry_date, DATE(entry_date) as date_only, good, content 
              FROM diary_entries 
              WHERE user_id = ? 
              ORDER BY entry_date DESC";
$stmt_debug = $conn->prepare($sql_debug);
$stmt_debug->bind_param("i", $partner_id);
$stmt_debug->execute();
$result_debug = $stmt_debug->get_result();

$all_entries = [];
while ($row = $result_debug->fetch_assoc()) {
    $all_entries[] = [
        'id' => $row['id'],
        'entry_date' => $row['entry_date'],
        'date_only' => $row['date_only'],
        'good' => $row['good'],
        'content' => substr($row['content'] ?? '', 0, 50) // First 50 chars for debug
    ];
}

error_log("DEBUG - ALL entries: " . json_encode($all_entries));

// Now get today's entries using DATE() function for proper comparison
$sql = "SELECT 
            id, 
            entry_date AS date, 
            good, 
            good_reason, 
            bad, 
            bad_reason, 
            content 
        FROM diary_entries 
        WHERE user_id = ? AND DATE(entry_date) = ?
        ORDER BY entry_date DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $partner_id, $today);
$stmt->execute();
$result = $stmt->get_result();

$entries = [];
while ($row = $result->fetch_assoc()) {
    $entries[] = $row;
}

error_log("DEBUG check_my_access - Found " . count($entries) . " diary entries for partner for today ($today)");

echo json_encode([
    "has_access" => true,
    "partner_name" => $request_data['partner_name'],
    "entries" => $entries,
    "date_filter" => "today",
    "today_date" => $today,
    "debug_all_entries" => $all_entries, // This will help us see what's in the database
    "debug_info" => [
        "server_time" => date('Y-m-d H:i:s'),
        "timezone" => date_default_timezone_get()
    ]
]);
?>