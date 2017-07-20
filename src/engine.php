<?php

$fileSrc = 'highscore.dat';
$resultsMaxCount = 10;

$action = (string)$_POST['action']; // przesyłanie akcji ajaxem

if($action == 'read'){
    $scoreBoard = readHighScore();
    echo json_encode($scoreBoard);
}

// zapisywanie do tabeli nazwy gracza i ilosci ruchów
if($action == 'save'){
    $player = (string)$_POST['player'];
    $playerMoves = (int)$_POST['moves'];
    $saveHighScore($player, $playerMoves);
}

    // sortowanie danych malejąco   
    function sortByScoreMaxToMin($a, $b){
        if ($a['moves'] == $b['moves']){
            return 0;
        } 
        return ($a['moves'] < $b['moves'])? -1 : 1;                
    }

    // zapisywanie wyników 
    function saveHighScore($playerName, $playerMoves){
        global $resultsMaxCount;
        global $fileSrc;

        $arrayTemp = Array(
            'player' => $playerName,
            'moves' => $playerMoves
        );

        $scoreBoard = readHighScore();
        
        array_push($scoreBoard, $arrayTemp);

        $length = min(count($scoreBoard), $resultsMaxCount);
        usort($scoreBoard, 'sortByScoreMaxToMin');
        
        $newScoreBoard = array_slice($scoreBoard, 0, $length);

        $fp = fopen($fileSrc, 'w');
        flock($fp, LOCK_EX);        
        foreach ($newScoreBoard as $record) {
            fwrite($fp, $record['player']."\r\n");
            fwrite($fp, $record['moves']."\r\n");
        }
        fclose($fp);
    }
    
    // odczytywanie wyników 
    function readHighScore(){
        global $fileSrc;

        //pobieramy plik do tablicy
        $fileLines = file($fileSrc);

        $highScore = Array();

        //robimy pętlę po liniach pliku i wrzucamy je do talbicy $highScore
        //każdy wynik zapisany jest w 2 liniach. Dlatego x za każdym razem zwiększamy o 2
        if (count($fileLines) > 1){
            $i = 0;
            
            for ($x=0; $x<count($fileLines); $x+=2){    
               
                $highScore[$i] = Array(
                    'player' => trim($fileLines[$x]),
                    'moves' => trim($fileLines[$x+1])
                );
                $i++;
            }
        }
        return $highScore;
    }

?>