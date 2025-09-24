<?php
session_start();
include "config.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fullname = $_POST["fullname"];
    $email    = $_POST["email"];
    $username = $_POST["username"];
    $password = $_POST["password"];
    $confirm  = $_POST["confirmPassword"];

    if ($password !== $confirm) {
        header("Location: register.html?error=Passwords do not match");
        exit;
    }

    $hashed = password_hash($password, PASSWORD_BCRYPT);
    
    try {
        $sql = "INSERT INTO users (fullname, email, username, password) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $fullname, $email, $username, $hashed);
        $stmt->execute();

        header("Location: login.html?success=Account created successfully");
        exit();

    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() == 1062) {
            // duplicate entry
            header("Location: register.html?error=Email or Username already exists");
        } else {
            // other DB error
            header("Location: register.html?error=" . urlencode($e->getMessage()));
        }
        exit();
    }
}
?>