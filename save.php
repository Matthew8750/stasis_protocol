<?php
$servername = "webhost1.eeecs.qub.ac.uk"; // Your database server (change if needed)
$username = "jrice27"; // Your database username
$password = "rZk8FVrXNllcPl8Y"; // Your database password
$dbname = "CSC1034_CW_13"; // Your database name

// Create database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check if connection works
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the username from the request
if (isset($_POST['username'])) {
    $username = $_POST['username'];

    // Prevent SQL injection by using a prepared statement
    $stmt = $conn->prepare("INSERT INTO player (name) VALUES (?)");
    $stmt->bind_param("s", $username);

    if ($stmt->execute()) {
        echo "Player Save Created!";
    } else {
        echo "Error: " . $conn->error;
    }

    $stmt->close();
}

$conn->close();
?>