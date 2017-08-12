
    // JavaScript function that wraps everything
    $(document).ready(function() {

      var wrestlerNameArray=["Hulk Hogan", "Ultimate Warrior", "The Rock", "Macho Man", "Ric Flair"];
      var characters = [];
      var currentPlayerIndex = -1;
      var currentOpponentIndex = -1;
      var opponentsDisabled = false;
      var gameStarted = false; // game starts when strike button is hit and pauses when choosing new opponent
      var gameLost = false; // only triggers when player loses
      var newGame = true; // only updates when reset button hit
      var currentStrikeNum=0; // keeps track of the number of times player makes a move
      var score = 0;
      var gamesPlayed = 0;
      var playerAudio;    

      createPlayers();

      // onclick events for characters
      $(".character").on("click", function(){
          // only triggers when game has NOT started yet
          if (!gameStarted){
            switch($(this).attr("status")){
              case "available-character":
                moveToRing(this);
                moveCharactersToOpponentBin();
                break;
              case "opponent-character":
                moveToRing(this);
                break;            
              case "current-player":
                moveToAvailablePlayersBin(this);
                break; 
              case "current-opponent":
                moveToAvailableOpponentsBin(this, "opponent-character");
                break;                         
              default:
                break;
            }
            checkIfRingEmpty(); 
          }         
      });

      $("#strikeBtn").on("click", function() {
        // only works if there is an opponent otherwise start game, disable opponents and make moves
        if ($("#opponent-character").children().length > 0){  
        gameStarted = true;  
        if (!opponentsDisabled){
          disableOpponents();
          opponentsDisabled = true;
        }
        if (newGame){
          console.log(newGame);
          gamesPlayed++;
          updateStats();
          newGame = false;          
        }

          //player starts with move
          makeRandomMove(currentPlayerIndex,currentOpponentIndex);
          // opponent makes a move if health > 0
          if (characters[currentOpponentIndex].health > 0)
            makeRandomMove(currentOpponentIndex,currentPlayerIndex);
        }
      });

      $("#infoBtn").on("click", function(){
           $("#info").fadeToggle();
      });
      $("#closeBtn").on("click", function(){
           $("#info").fadeToggle();
      });
      $("#resetBtn").on("click", function(){
           resetGame();
      });        
      $(document).mouseup(function(e){
          // if the information div is open, toggle it close
          var container = $("#info");
          // if the target of the click isn't the container nor a descendant of the container
          if (!container.is(e.target) && container.has(e.target).length === 0) 
          {
              container.hide();
          }

    });

    function createPlayers(){
      for (var i = 0; i < wrestlerNameArray.length; i++) {
        var characterImage = "wrestler" + i + ".jpg";
        var characterAudio = "wrestler" + i + ".mp3";
        var character = {
          name: wrestlerNameArray[i],
          status: "available-character",
          image: characterImage,
          health: Math.round((Math.random()*80 + 120)),
          strikePower: Math.round((Math.random()*5 + 1)),
          counterPower: Math.round((Math.random()*5 + 1)),
          audio: characterAudio,

          newHealth: function(){
            this.health = Math.round((Math.random()*80 + 120));
          },
          newStrike: function(){
            this.strikePower = Math.round((Math.random()*5 + 1));
          },
          newCounterPower: function(){
            this.counterPower = Math.round((Math.random()*5 + 1));
          }          
        }

        characters.push(character);

        var wrestler = $("<figure class='well character center-block pull-left'>");
        wrestler.attr("id", character.name.replace(/\s/g, ''));
        wrestler.attr("status", character.status);

        var wrestlerImage = $("<img>");

        wrestlerImage.addClass("figure-img img-fluid center-block rounded icon");
        wrestlerImage.attr("src", character.image);
        wrestler.append(wrestlerImage);

        var wrestlerTitle = $("<fig-caption center-block>");
        wrestlerTitle.text(character.name);
        wrestlerTitle.addClass("figcaption center-block text-center");
        wrestler.append(wrestlerTitle);      
        
        var wrestlerHealth = $("<fig-caption center-block>");
        wrestlerHealth.attr("id",character.name.replace(/\s/g, '') + "Health");
        wrestlerHealth.text("Health:" + character.health + " Strike Pwr:" + character.strikePower + " Counter Pwr:" + character.counterPower);
        wrestlerHealth.addClass("figcaption center-block text-center");
        wrestler.append(wrestlerHealth);  

        $("#availablePlayersBin").append(wrestler);
      }
      checkIfRingEmpty();
      updateStats();
    }
    function moveToRing(obj){
      var classes= $(obj).attr("class");

      if ($("#player-character").children().length == 0 && $(obj).attr("status")=="available-character"){
          $("#player-character").append(obj);
          $(obj).attr("status", "current-player");
          currentPlayerIndex = characters.findIndex(x => x.name.replace(/\s/g, '')==obj.id);
          characters[currentPlayerIndex].status = "current-player";           
          moveCharactersToOpponentBin();
      }
      else if ($("#opponent-character").children().length == 0 && $(obj).attr("status")=="opponent-character"){
          $("#opponent-character").append(obj);
          $(obj).attr("status", "current-opponent");       
          currentOpponentIndex = characters.findIndex(x => x.name.replace(/\s/g, '')==obj.id);         
          characters[currentOpponentIndex].status ="current-opponent";   
      } 
      else if ($("#player-character").children().length == 0 && $(obj).attr("status")=="opponent-character"){
          moveToAvailablePlayersBin(obj);
      } 
      else if ($("#opponent-character").children().length > 0 && $(obj).attr("status")=="opponent-character"){
          moveToAvailablePlayersBin(obj);
      }       
    }
    function moveCharactersToOpponentBin(){
      $("#availablePlayersBin").children(".character").each( function(){  
        $(this).attr("status", "opponent-character")        
        moveToAvailableOpponentsBin(this, "opponent-character");
      })
    }
    function moveToAvailablePlayersBin(obj){
        $(obj).attr("status", "available-character")
        $("#availablePlayersBin").append(obj);
    }
    function moveToAvailableOpponentsBin(obj, status){
        $(obj).attr("status", status)
        $("#availableOpponentsBin").append(obj);
    }
    function checkIfRingEmpty(){
      //depending on characters in ring, show/hide strike and reset buttons and vs. sign
      if ($("#player-character").children().length == 0 || $("#opponent-character").children().length == 0){
        $("#versus").hide();
        $("#strikeBtn").hide(); 
      } else {
          $("#versus").show();  
          $("#strikeBtn").show();   
      }

      if (newGame && gameStarted){
        $("#resetBtn").show();
        newGame = false;
        gameStarted = false;
      }
      else
        $("#resetBtn").hide();
                
    }
    function disableOpponents(){
      //disable the available opponents by dimming the opacity
      // for all characters, disable any pointer events
      //  if not currently player or opponent then dim the display
      for (var i = 0; i < characters.length; i++) {
            var idName = "#" + characters[i].name.replace(/\s/g, '');
            $(idName).css('pointer-events','none');
         if (i != currentPlayerIndex && i != currentOpponentIndex){
            $(idName).css("opacity", .2);
        }
      }
    }
    function enableOpponents(){
      //enable the available opponents if status not disabled for current player or opponent
      for (var i = 0; i < characters.length; i++) {
        var idName = "#" + characters[i].name.replace(/\s/g, '');
        if (i != currentPlayerIndex && characters[i].status!="defeated")         
          $(idName).css('pointer-events','auto');        
        if (i != currentPlayerIndex && i != currentOpponentIndex && characters[i].status != "defeated"){
            $(idName).css("opacity", 1);
        }
      }
    }    
    function makeRandomMove(playerIndex, opponentIndex){
      // find random move in array, add strike power of player and increment by starting base value
      var randomPoints = Math.floor((Math.random() * 20) + 10);
      var wrestlingMoves = ["dropkicks", "leg drops","with a backbreaker on", "drops a brainbuster on", "chokeslams",  "Diamond Cutter DDTs", "drops a facebuster",
                            "does a neckbreaker on", "piledrives", "powerbombs", "powerslams", "with a stunner on", "suplexes","does a Boston crab on", 
                            "full-nelsons", "places a sharpshooter on", "moonsaults on"];
      var randomMove = wrestlingMoves[Math.floor((Math.random() * wrestlingMoves.length))];
      var wrestlerName = characters[playerIndex].name;
      var opponentName = characters[opponentIndex].name;
      
      currentStrikeNum++;
      // add on current player's strike points and increase strike power
      if (characters[playerIndex].status == "current-player"){
        randomPoints += characters[playerIndex].strikePower;
        var numMove = Math.round(currentStrikeNum/2);
        characters[playerIndex].strikePower += characters[playerIndex].strikePower/numMove;
      }
      
      // subtract the opponent's counter power
      randomPoints -= characters[opponentIndex].counterPower;
      var randomPointsText = "";
      if (isEven(currentStrikeNum))
        randomPointsText = "(-" + randomPoints.toString() + ")";
      else
        randomPointsText = "(+" + randomPoints + ")";

      $("#messageBoard").prepend("<div>[" + currentStrikeNum + "]: " + wrestlerName + " " + randomMove + " " + 
                                  opponentName + "! " + randomPointsText + " points. </div>");

      evaluateMove(opponentIndex, randomPoints);
    }
    function evaluateMove(playerIndex, points){
      // apply moves to opponent and checks for end of game
      // subtract points from character, update display and check if game over
      characters[playerIndex].health -= points;

      var player = getID(playerIndex) + "Health";

      // round up health points to 0 if negative
      if (characters[playerIndex].health < 0){ 
        characters[playerIndex].health=0;
      }
      updateHealthElement(playerIndex);
      isGameOver(characters[playerIndex], playerIndex);
    }
    function isGameOver(player, playerIndex){
      // evaluate if current player health or opponent health equals 0
      // if current player lost then game over
      if (player.health == 0 && player.status == "current-player"){
        var indexOfOpponent = characters.findIndex(x => x.status == "current-opponent");

        playerAudio = "#wrestler" + currentOpponentIndex + "Audio";
        $(playerAudio).get(0).play();        
        gameOver = true;
        opponentsDisabled = false;
        gameStarted = true;
        newGame = true;
        player.status = "defeated";
        $(getID(playerIndex)).attr("status", "defeated");
        $(getID(playerIndex)).css("opacity", .2);
        moveToAvailablePlayersBin($(getID(playerIndex)));
        checkIfRingEmpty();
        alert("Game Over... " + characters[indexOfOpponent].name + " wins!");
        $("#messageBoard").prepend("<div>" +" ************ you lost. " + characters[indexOfOpponent].name + " wins!"+"***********" + "</div>")
      } 

      // else if player defeated opponent, disable opponent,  
      // move back to opponents bin and enable the the opponents
      else if (player.health == 0 && player.status == "current-opponent"){
        playerAudio = "#wrestler" + currentPlayerIndex + "Audio";
        $(playerAudio).get(0).play();        
        player.status = "defeated";
        $("#messageBoard").prepend("<div>" +" ************ " + player.name + " defeated!"+"***********" + "</div>")        
        var playerIndex = characters.findIndex(x => x.name == player.name);
        $(getID(playerIndex)).css("opacity", .2);
        moveToAvailableOpponentsBin($(getID(playerIndex)), player.status);   
        currentStrikeNum++; // account for the opponents "move" to keep counter going

        // check to see if there are anymore available opponents else the game is over
        var moreOpponentsIndex = characters.findIndex(x => x.status =="available-character")
        if (moreOpponentsIndex!= -1){
          enableOpponents();
          opponentsDisabled = false;
          gameStarted = false;
          checkIfRingEmpty();    //removes reset button if previously there       
          alert(player.name + " defeated! Choose next opponent.");           
        }
        else {
          playerAudio = "#wrestler" + currentPlayerIndex + "Audio";
          $(playerAudio).get(0).play();
          score++;
          alert("No More Opponents! You Win!")
          $("#messageBoard").prepend("<div>" +" ************ no more opponents. You WIN!!  ***********" + "</div>");
          gameStarted = true;
          newGame = true;
          checkIfRingEmpty();
          updateStats();
        }
      }
    }
    function updateHealthElement(playerIndex){
      var playerID = getID(playerIndex) + "Health";

      if (characters[playerIndex].health>0) {
        $(playerID).html("Health:" + characters[playerIndex].health + 
                          " Strike Pwr:" + characters[playerIndex].strikePower + 
                          " Counter Pwr:" + characters[playerIndex].counterPower);
      }
     else{
        $(playerID).html("Defeated");
     }
    }
    function unDimCharacter(playerIndex){

      var playerID = getID(playerIndex);
      $(playerID).css("opacity", 1);
      moveToAvailablePlayersBin($(playerID));  
    }
    function getID(index){
      return "#" + characters[index].name.replace(/\s/g, '');
    }
    function resetGame(){
      newGame = true;
      gameStarted = false;
      currentStrikeNum = 0;
      currentPlayerIndex = -1;
      currentOpponentIndex = -1;
      $("#messageBoard").html("");
      for (var i = 0; i < characters.length; i++) {
          characters[i].status="available-character";
          characters[i].newHealth();
          characters[i].newStrike();
          characters[i].newCounterPower();
          updateHealthElement(i);
          unDimCharacter(i);
          checkIfRingEmpty();
      }
      enableOpponents();
      opponentsDisabled = false;      
    }
    function updateStats(){
      var currentScore = "Score:" + score;
      var currentGP = "Games:" + gamesPlayed;
      $("#score").text(currentScore);
      $("#gamesPlayed").text(currentGP); 
    }
    function isEven(value) {
      return (value%2 == 0);
    }

});


