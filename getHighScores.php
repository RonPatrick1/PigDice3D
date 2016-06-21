<?php

//CIS 371 - Semester Project 
//Ron Patrick
//Pig Dice 3D

function connect() {

    $connection = new mysqli("127.0.0.1", "tempAccount", "tempApassword", "mysql");
    //$connection = new mysqli("192.168.1.83", "tempAccount", "tempApassword", "mysql");
    //$connection = new mysqli("127.0.0.1", "patricro", "patricro", "patricro");
    if (!$connection || $connection->connect_error) {
        die('Unable to connect to database [' . $connection->connect_error . ']');
    }
    return $connection;
}

if(isset($_GET["randomMessage"])) {
    header('Content-Type: text/xml');
    $xmlDoc = new DomDocument();
    echo "<scores>\n";
    $conn=connect();
    $sql="select * from HighScores order by Score desc limit 10;";
    $result = $conn->query($sql);
    if ($result->num_rows>0) {
        foreach($result as $row) {
            echo "<HSentry>\n";
            echo "<player>".$row["Player"]."</player>\n";
            echo "<score>".$row["Score"]."</score>\n";
            echo "</HSentry>\n";
        }
    }
    $sql="select * from HighWinLoss order by Score desc limit 10;";
    $result = $conn->query($sql);
    if ($result->num_rows>0) {
        foreach($result as $row) {
            echo "<WLentry>\n";
            echo "<player>".$row["Player"]."</player>\n";
            echo "<score>".$row["Score"]."</score>\n";
            echo "</WLentry>\n";
        }
    }
    $conn->close();
    echo "</scores>\n";
} else {
    header("Location: index.php");
}
?>