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
    echo "<games>\n";
    $conn=connect();
    $sql="select * from games;";
    $result = $conn->query($sql);
    if ($result->num_rows>0) {
        foreach($result as $row) {
            echo "<gameEntry>\n";
            echo "<GameName>".$row["GameName"]."</GameName>\n";
            echo "<NumPlayers>".$row["NumPlayers"]."</NumPlayers>\n";
            echo "<Started>".$row["Started"]."</Started>\n";
            echo "</gameEntry>\n";
        }
    }
    else {
        echo "<noGames>yep</noGames>\n";
    }
    $conn->close();
    echo "</games>\n";
} else {
    header("Location: index.php");
}
?>