<?php
session_start();
include "config.php"; // database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];

    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user["password"])) {
            // Login success
            $_SESSION["user_id"] = $user["id"];
            $_SESSION["username"] = $user["username"];

            // Redirect to diary page
            header("Location: mydiary.html?message=Login successful");
            exit();
        } else {
            header("Location: login.html?error=Incorrect password");
            exit();
        }
    } else {
        header("Location: login.html?error=User not found");
        exit();
    }
}
?>