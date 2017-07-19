(function(){
    
    // zalożenia gry 
    var TILES_COUNT = 20; // 5x4 stała określająca ilość kafelków na planszy
    var tiles = []; // tablica z wygenerowanymi kafelkami
    var clickedTiles = []; // kliknięte kafelki (max 2, a potem sa czyszczone)
    var canGet = true; // czy aktualnie mozna klikac
    var movesCount = 0; // liczba ruchów gracza
    var tilesPair = 0; // sparowane kafelki. Maksymalnie 2x mniej niż TILES_COUNT
    var engineSrc = '../src/engine.php'; // sciezka do pliku engine dla highscore

    // puste tablice przy startowaniu gry
    startGame = function(){
        tiles = [];
        clickedTiles = [];
        canGet = true;
        movesCount = 0;
        tilesPair = 0;        

        // czyszczenie planszy z grą
        var $gameBoard = $('#gameBoard').empty();

        // ustawienie tablicy z numerami kafelków
        for(var i=0; i<TILES_COUNT; i++){
            tiles.push(Math.floor(i/2));
        }

        // mięszanie tablicy z numerami kafelków
        for(i=TILES_COUNT-1; i>0; i--){
            var swap = Math.floor(Math.random()*i);
            var tmp = tiles[i];
            tiles[i] = tiles[swap];
            tiles[swap] = tmp;
        }

        // generowanie kafelków i wrzucenie ich na planszę 
        for(i=0; i<TILES_COUNT; i++){            
            var $cell = $('<div class="cell"></div>');
            var $tile = $('<div class="tile"><span class="avers"></span><span class="revers"></span></div>');
            $tile.addClass('card-type-'+tiles[i]); 
            $tile.data('cardType', tiles[i])
            $tile.data('index', i);

            $cell.append($tile);
            $gameBoard.append($cell);                               
        }
        
        // kafelek został kliknięty
        $gameBoard.find('.cell .tile').on('click', function(){
            tileClicked($(this))
        });  
        
    }

    // pokazywanie ruchów
    showMoves = function(moves){
        $('#gameMoves').html(moves);
    }

    
    // odsłanienie kafelków po kliknieciu w niego
    tileClicked = function(element){

        /* jeżeli jeszcze nie pobraliśmy 1 elementu 
        lub jeżeli index tego elementu nie istnieje w pobranych */
        if(canGet){     
            if(!clickedTiles.length || (element.data('index') != clickedTiles[0].data('index'))){                
                clickedTiles.push(element);
                element.addClass('show');                
            }          

            // jeżeli kliknięte są więcej niż 2 elementy lub
            if(clickedTiles.length >= 2){
                canGet = false;
                
                // odsłanienie kafelków 
                if(clickedTiles[0].data('cardType') === clickedTiles[1].data('cardType')){
                    setTimeout(function() {deleteTiles()}, 500);
                }
                else{
                    setTimeout(function() {resetTiles()}, 500);
                }

                // zliczanie kliknięć 
                movesCount++;
                showMoves(movesCount);
            }
        }
    }

    /* funkcja ukrywania kafelków - jeżeli są różne, ponownie je ukrywamy (resetTiles()).
    Tablica clickedTiles zawiera numery typów aktualnie wybranych kafelków.
    Jeżeli długość tablicy clickedTiles jest równa 2 (czyli 2 kafelki zostały kliknięte) */
    resetTiles = function(){
        clickedTiles[0].removeClass('show');
        clickedTiles[1].removeClass('show');
        clickedTiles = new Array();
        canGet = true;
    }

    // kończenie gry 
    gameOver = function(){
        saveHighScore();        
    }

    // Jeżeli kliknięte kafeli są takie same, wtedy usuwamy je z planszy (deleteTiles())
    deleteTiles = function(){     
        clickedTiles[0].fadeOut(function(){
            $(this).remove();
        });
        
        clickedTiles[1].fadeOut(function(){
            $(this).remove();                        
        });

        // liczenie sparowanych kafelków 
        tilesPair++;
        clickedTiles = new Array();
        canGet = true;
        
        // jeśli są sparowane wszystkie kafelki, to koniec gry 
        if(tilesPair >= TILES_COUNT / 2){
            gameOver();
        }        
    }

    showLoading = function(){
        $('.loading').show();
    }

    hideLoading = function(){
        $('.loading').hide();
    }

    // pokazywaie nazwy gracza 
    showPlayerName = function(){
        showStage('stagePlayerName');
        $('#checkName').on('click', function(){
            if ($('#playerName').val()!=''){
                $('.player-name-box').removeClass('error');
                startGame();
                showStage('stageGame');
            }
            else{
                $('.player-name-box').addClass('error');
                return false;
            }
        });                        
    }

    
    // zapisywanie wyników
    saveHighScore = function(){        
        showLoading();
        var playerName = $('#playerName').val();    
        
        // AJAX - przesyłanie danych do bazy 
        $.ajax({
            url : "src/engine.php",
            type : 'POST',            
            data : {
                action : 'save',
                player : playerName,
                moves : movesCount
            },
            success : function(){

            },         
            error : function(){
                console.log('Error! :(')
            },
            complete : function(){
                showHighScore();
                hideLoading();
            }
        })
    }

    // pokazywanie wyników
    showHighScore = function(){
        showLoading();
        
        // AJAX - przesyłanie danych z bazy 
        $.ajax({
            url : "src/engine.php",
            type : 'POST',            
            data : {
                action : 'read'                
            },
            dataType : 'json',
            success : function(r){                
                $('#highscoreBoard').empty();
                for (x=0; x<r.length; x++){
                    var record = r[x];                    
                    var $div = $('<div class="line"><strong class="player">'+record.player+' :</strong><span class="moves">'+record.moves+'</span></div>');
                    $('#highscoreBoard').append($div);
                }                   
            },         
            error : function(){
                console.log('Error! :(')                
            },
            complete : function(){
                hideLoading();
                showStage('stageHighscore');
            }
        })
        
    }
    
    // pokazywanie etapu 
    showStage = function(stage){
        $('[class^=slide-]').removeClass('show');
        $('#'+stage).addClass('show');
    }    

    // 
    bindEvents = function(){        
        $('#startGame').on('click', function(e){
            e.preventDefault();
            showPlayerName();                
        });
        $('#showHighscore').on('click', function(e){
            e.preventDefault();
            showHighScore();
        })
        $('.close-highscore').on('click', function(e){
            e.preventDefault();
            showStage('stageStart');
        })
    }    

    //
    init = function(){
        $(function(){
            bindEvents();
        });
    }

    init();
    
})();    