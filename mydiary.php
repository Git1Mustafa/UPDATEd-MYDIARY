<?php
date_default_timezone_set("Asia/Kolkata");

error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// Always return JSON
header("Content-Type: application/json");

// Database connection
include "config.php";

// Handle actions
$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case "register":
        $username = $_POST['username'];
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

        $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $username, $password);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "User registered"]);
        } else {
            echo json_encode(["status" => "error", "message" => "User already exists"]);
        }
        break;

    case "login":
        $username = $_POST['username'];
        $password = $_POST['password'];

        $stmt = $conn->prepare("SELECT id, password FROM users WHERE username=?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if (password_verify($password, $row['password'])) {
                $_SESSION['user_id'] = $row['id'];
                echo json_encode(["status" => "success", "message" => "Login successful"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid password"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "User not found"]);
        }
        break;

    case "logout":
        session_destroy();
        echo json_encode(["status" => "success", "message" => "Logged out"]);
        break;
    case "save":
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(["status" => "error", "message" => "You must be logged in"]);
            exit;
        }

        $user_id = $_SESSION['user_id'];
        $entry_date = $_POST['entry_date'];
        $good = $_POST['good'];
        $good_reason = $_POST['good_reason'];
        $bad = $_POST['bad'];
        $bad_reason = $_POST['bad_reason'];
        $content = $_POST['content'];

        $stmt = $conn->prepare("
            INSERT INTO diary_entries (user_id, entry_date, good, good_reason, bad, bad_reason, content, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
                good = VALUES(good),
                good_reason = VALUES(good_reason),
                bad = VALUES(bad),
                bad_reason = VALUES(bad_reason),
                content = VALUES(content),
                updated_at = NOW()
        ");
        $stmt->bind_param("issssss", $user_id, $entry_date, $good, $good_reason, $bad, $bad_reason, $content);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Diary saved/updated"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to save"]);
        }
        break;

    case "view":
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(["status" => "error", "message" => "You must be logged in"]);
            exit;
        }

        $user_id = $_SESSION['user_id'];
        $entry_date = $_GET['date'];

        $stmt = $conn->prepare("
            SELECT id, entry_date, good, good_reason, bad, bad_reason, content, created_at, updated_at
            FROM diary_entries
            WHERE user_id = ? AND entry_date = ?
            LIMIT 1
        ");
        $stmt->bind_param("is", $user_id, $entry_date);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            echo json_encode(["status" => "success", "data" => $row]);
        } else {
            echo json_encode(["status" => "error", "message" => "No diary found"]);
        }
        break;

    case "list":
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(["status" => "error", "message" => "You must be logged in"]);
            exit;
        }

        $user_id = $_SESSION['user_id'];

        $stmt = $conn->prepare("
            SELECT id, entry_date, good, good_reason, bad, bad_reason, content, created_at, updated_at
            FROM diary_entries
            WHERE user_id = ?
            ORDER BY entry_date DESC
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $entries = [];
        while ($row = $result->fetch_assoc()) {
            $entries[] = $row;
        }

        echo json_encode(["status" => "success", "entries" => $entries]);
        break;

    case "partner_list":
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(["status" => "error", "message" => "You must be logged in"]);
            exit;
        }

        $user_id = $_SESSION['user_id'];

        // Get partner id
        $stmt = $conn->prepare("SELECT partner_id FROM users WHERE id=?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        $partner_id = $res['partner_id'] ?? null;

        if (!$partner_id) {
            echo json_encode(["status" => "error", "message" => "No partner linked"]);
            exit;
        }

        // Check if there's an accepted request (user sent request, partner accepted)
        $stmt = $conn->prepare("
            SELECT id FROM diary_requests 
            WHERE sender_id=? AND receiver_id=? AND status='accepted'
        ");
        $stmt->bind_param("ii", $user_id, $partner_id);
        $stmt->execute();
        $request_check = $stmt->get_result()->fetch_assoc();

        if (!$request_check) {
            echo json_encode(["status" => "error", "message" => "Partner has not accepted your diary sharing request"]);
            exit;
        }

        // Get partner's diary entries
        $stmt = $conn->prepare("
            SELECT id, entry_date, good, good_reason, bad, bad_reason, content, created_at, updated_at
            FROM diary_entries
            WHERE user_id = ?
            ORDER BY entry_date DESC
        ");
        $stmt->bind_param("i", $partner_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $entries = [];
        while ($row = $result->fetch_assoc()) {
            $entries[] = $row;
        }

        echo json_encode(["status" => "success", "entries" => $entries]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
}
?>