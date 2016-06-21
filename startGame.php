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

if(isset($_GET["GameName"])) {
    $name=$_GET["GameName"];
    header('Content-Type: text/xml');
    $xmlDoc = new DomDocument();
    echo "<status>\n";
    $conn=connect();
    $sql="insert into games (GameName, NumPlayers, Started) values ('".$name."','1','false');";
    $result = $conn->query($sql);
    if ($result === FALSE) {
        echo "<result>failed</result>\n";
    }
    else {
        echo "<result>success</result>\n";
    }
    $conn->close();
    echo "</status>\n";
} else {
    header("Location: index.php");
}
?>