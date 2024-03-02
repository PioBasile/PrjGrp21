const express = require('express');
const app = express();
const http = require('http');
const {Server} = require("socket.io");
const cors = require("cors");
const { start } = require('repl');
const { platform } = require('os');
const roomName = "room"

// CUSTOM LIB
const {
  makecookie,
  Lobby,
  Player_IN_Lobby,
  Bataille_Card,
  Player,
  Bataille,
  STATUS,
  findRemovePlayer,
  findCard,
  shuffle,
  generateCartes,
  findPlayer,
  findGame,
  findLobby,
  findWaitingPlayer,
  generate6Cartes,
  Carte6,
  SixQuiPrend,
  MilleBorne,
  MB_Player,
  getOpponent,
  State,
  GameState

} = require("./JS_CustomLib/D_utils.js");
const { login, changeDataBase, get_user_info, register } = require("./JS_CustomLib/D_db.js");
const { Roulette} = require("./JS_CustomLib/D_Casino.js");
const { Statement } = require('sqlite3');
const { cp } = require('fs');



app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin:"http://localhost:3000",
        methods: ["GET", "POST"],
    },
    
});


// VARIABLES 

let validCookies = {};
let BatailGames = [];
let TaureauGames = [];
let MilleBornesGames = [];
let lobbyList = [];
let lobbyIndex = 0;
let RouletteInstance = new Roulette();
let isPaused = false;


//

server.listen(3001, () =>{
    console.log("SERVER IS RUNNING");
})



const updateWins = async () => {
  for (const win of RouletteInstance.wins) {
      try {
          const res = await get_user_info(win["name"]);
          console.log(res.argent);
          console.log(win);
          await changeDataBase("argent", res.argent + win["won"], win["name"]);
      } catch (error) {
          console.error("Erreur lors de la mise à jour des gains :", error);
      }
  }
}

const interval = setInterval(() => {

  if(isPaused){
    return
  }

  RouletteInstance.timer = RouletteInstance.timer - 1;

  if(RouletteInstance.timer == 0){

    RouletteInstance.rolls();
    console.log("ROLL : " + RouletteInstance.roll);
    io.emit('spinwheel',RouletteInstance.roll);
    RouletteInstance.resolveBets();

    updateWins();

    io.emit("listWins",RouletteInstance.wins);

    RouletteInstance.wins = [];
    RouletteInstance.bets = [];

    isPaused = true;
    setTimeout(() => {
      isPaused = false;
    }, 9000);

    RouletteInstance.timer = 30;

  }


  io.emit('timerDown');
  io.emit('rouletteTimer',RouletteInstance.timer);
}, 1000);


io.on('connection', (socket) => {

  // --------------------------------------Casino-------------------------------------------------------

  socket.on("bet", (nom,betAmmount,betPos) => {

    if(betAmmount <= 0 ){
      return
    }

    if(RouletteInstance.timer > 5){

      RouletteInstance.bets.push({nom:nom, betAmmount:betAmmount, betPos:betPos});
      get_user_info(nom).then((res) => {

        changeDataBase("argent", res.argent - betAmmount, nom);
        socket.emit("VoilaTesSousMonSauce", res.argent - betAmmount);

      });
      

    }
    else{

      socket.emit("tropsTard");

    }

    console.log(RouletteInstance.bets);
    io.emit("bets",RouletteInstance.bets);
    

  });

  socket.on("ArgentViteBatard",(name)=> {

    get_user_info(name).then((res) => {

      socket.emit("VoilaTesSousMonSauce", res.argent);

    });

  });

  // ----------------------------------------------------------------------------------------------------------

    console.log("Connection par : " + socket.id);
    
    
    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
  });


    // -------------------------------------------------------- CONNECTION -------------------------------------

    socket.on('login', (username, password) => {

  
      login(username,password).then((value) => {
        if(value == 1){
          cookie = makecookie(10);
          socket.emit('succes', cookie, username);
          validCookies[username] = cookie;
        } else {
          socket.emit('failure');
        }
      });

    });

    socket.on('register', (username,password) => {

        register(username,password).then((value) => {
          if(value == 1){
            cookie = makecookie(10);
            socket.emit('succes', cookie, username);
            validCookies[username] = cookie;
          } else {
            socket.emit('failure');
          }
        });

    });

    socket.on('co', (name, cookie) => {


      if(validCookies[name] == cookie){
        return;
      } else {
        socket.emit('deco', name);
      }

    });



    // GESTION LOBBY //
  
    socket.on('newServer', (serverName, nbPlayerMax, isPrivate, password, gameType, owner) => {

        let Nlobby = new Lobby(serverName, parseInt(nbPlayerMax), isPrivate, password, gameType, lobbyIndex, owner);
        lobbyList.push(Nlobby);
        lobbyIndex++;
        io.emit('newServer', lobbyList);

    });

    socket.on('joinLobby',(name,lobbyID,cookie) => {

      clobby = findLobby(lobbyID,lobbyList);
      cplayer = new Player_IN_Lobby(name,cookie);
      clobby.playerList.push(cplayer);
      io.emit('newServer', lobbyList);

    });

    socket.on('whoIsHere', (lobbyID) => {

      clobby = findLobby(lobbyID,lobbyList);
      io.emit('update', clobby.playerList);

    });

    socket.on('join', (room) => {

      socket.join(room);

    });

    socket.on('leave', (room) => {

      socket.leave(room);

    });

    socket.on("getServ", ()=>{

      socket.emit('newServer', lobbyList);

    });

    socket.on('WhereAmI',(lobbyID)=> {

      let clobby = findLobby(lobbyID,lobbyList);
      socket.emit('here', clobby);
      io.to(lobbyID).emit('here', clobby);

    });

    socket.on('ready', (lobbyID,name)=> {

      let clobby = findLobby(lobbyID,lobbyList);
      let cplayer = findWaitingPlayer(name,clobby.playerList);

      cplayer.isReady = !cplayer.isReady;
      socket.emit('here', clobby);
      io.to(lobbyID).emit('here', clobby);



    });

    socket.on('deco_lobby', (lobbyID, name) => {

      let clobby = findLobby(lobbyID,lobbyList);
      let cplayer = findWaitingPlayer(name,clobby.playerList);

      clobby.playerList.splice(clobby.playerList.indexOf(cplayer),1)
      io.to(lobbyID).emit('here', clobby);
      io.to(lobbyID).emit('disconected', name);
      io.emit('newServer', lobbyList);

    });

    socket.on('updateParam', (lobbyID, maxPlayers, timeBetweenTurn, roundsMax) => {

      let clobby = findLobby(lobbyID,lobbyList);

      clobby.nbPlayerMax = parseInt(maxPlayers);
      clobby.tbt = parseInt(timeBetweenTurn);
      clobby.maxTurn = parseInt(roundsMax);

      io.emit('newServer', lobbyList);
      io.to(lobbyID).emit('lobbyParams',maxPlayers, timeBetweenTurn, roundsMax);

    });

    socket.on('askStat', (name) => {

      get_user_info(name).then((res) => {

        socket.emit('stats', res);

      });

    });


    socket.on('StartGame', (lobbyID) => {

      lobby = findLobby(lobbyID,lobbyList);
      owner = lobby.owner;
      let plist = [];

      lobby.playerList.forEach((player) => {

        plist.push(new Player(player.username,player.cookie))

        get_user_info(player.username).then((res) => {

          changeDataBase('nbGames',res.nbGames + 1,player.username);
      
        });

      });

      let nGame;

      if(lobby.gameType === "sqp"){

        nGame = new SixQuiPrend(lobbyID, owner, plist, 10)
        TaureauGames.push(nGame);

      } 


      //CHANGE SOME STUFF HERE TO
  
      else if (lobby.gameType === "mb") {
  
  
  
        let mbPlist = [];
  
        let color = ["pink","red", "yellow", "green"];
  
        plist.forEach((player, index) => {
          let newMB_player = new MB_Player(player.name, player.cookie, color[index]);
          mbPlist.push(newMB_player);
        })
  
        nGame = new MilleBorne(lobbyID, owner, mbPlist);
  
        MilleBornesGames.push(nGame);
      }
  
      //HERE
  
      else {
        nGame = new Bataille(lobbyID, lobby.nbPlayerMax, lobby.maxTurn, owner, plist);
        BatailGames.push(nGame);
  
      }

      io.to(lobbyID).emit('start',lobby.gameType);
      nGame.status = STATUS.WAITING_FOR_PLAYER_CARD;


    });


    // JEU BATAILLE

      // PHASE 1 : Distribution des cartes a tout les joueurs //

    socket.on('WhatIsMyDeck', (username,gameID) => {

      game = findGame(gameID,BatailGames);
      player = findPlayer(username,game.playerList);

      socket.emit('Deck',player.deck);

    });

    socket.on('askGameInfo', (GameID) => {

      game = findGame(GameID,BatailGames);
      socket.emit('getInfo', game);

    });

      // Phase de choix, permet au joueurs de choisir leurs cartes et une fois tout les cartes chosis donne le résultat du round //
    socket.on('PhaseDeChoix', (GameId, playerName, card) => {

      let game = findGame(GameId,BatailGames);
      let player = findPlayer(playerName,game.playerList);

      player.selected = card;

      let readyUP = true;
      game.playerList.forEach((player) => {
        if (player.selected == null && !player.out) {
          readyUP = false;
        }

      });
      if (!readyUP) {
        return;
      } else {
        game.resolve();
        let count = 0;

        game.playerList.forEach((player)=>{

          // HAHAHAHAHAHA
          if(player.deck[0] == [][0]){
            player.out = true;
            count++;
          }
    
        });
    
        if(count >= game.playerList.length - 1 || game.currentTurn == game.maxTurn){
          io.to(GameId).emit('FIN',game.scoreboard, game.playerList);

          let max = -1;
          let winner = [];
          game.playerList.forEach((player) => {

            if(max < game.scoreboard[player.name]){
              max = game.scoreboard[player.name];
              winner = [playerName];
            } else if (max == game.scoreboard[player.name]){
              winner.push(player.name);
            }

          });

          winner.forEach((player) => {

            get_user_info(player).then((res) => {

            
              changeDataBase('nbWin',res.nbWin + 1,player);
          
            });

          });
        } else {
          if(game.Rdraw != null){
            game.Rdraw.forEach((player) => {

              CardIndex = Math.floor(Math.random() * player.deck.length);
              player.deck.splice(CardIndex,1)

            });
            io.to(GameId).emit('Draw',game.Rdraw);
        } else {
            io.to(GameId).emit('Winner',game.Rwinner);
            game.currentTurn++;
        }
      }
    }

    });

      // POUR RESOUDRE LES EGALITE
    socket.on('ResoudreEgalite', (GameId, playerName, card) => {

      let game = findGame(GameId,BatailGames);
      let player = findPlayer(playerName,game.playerList);

      player.selected = card;

      let readyUP = true;
      game.Rdraw.forEach((player) => {
        if (player.selected == null && !player.out) {
          readyUP = false;
        }

      });
      if (!readyUP) {
        return;
      } else {
        game.resolve_draw();
        let count = 0;

        game.playerList.forEach((player)=>{

          // HAHAHAHAHAHA
          if(player.deck[0] == [][0]){
            player.out = true;
            count++;
          }
    
        });
    
        if(count >= game.playerList.length - 1 || game.currentTurn == game.maxTurn){
          io.to(GameId).emit('FIN',game.scoreboard, game.playerList);
          let max = -1;
          let winner = [];
          game.playerList.forEach((player) => {

            if(max < game.scoreboard[player.name]){
              max = game.scoreboard[player.name];
              winner = [playerName];
            } else if (max == game.scoreboard[player.name]){
              winner.push(player.name);
            }

          });

          winner.forEach((player) => {

            get_user_info(player).then((res) => {

              changeDataBase('nbWin',res.nbWin + 1,player);
          
            });

          });

        } else {
          if(game.Rdraw != null){
            game.Rdraw.forEach((player) => {

              CardIndex = Math.floor(Math.random() * player.deck.length);
              player.deck.splice(CardIndex,1)

            });
            io.to(GameId).emit('Draw',game.Rdraw);
        } else {
            io.to(GameId).emit('Winner',game.Rwinner);
            game.currentTurn++;
        }
      }
    }

  });

    socket.on('leaveGame', (playerName, GameId) => {

      let game = findGame(GameId,BatailGames);
      let player = findPlayer(playerName,game.playerList);

      game.removePlayer(player);
      io.to(GameId).emit('getInfo', game);


    });

    socket.on("sendMessage", (data) => {
      io.to(data.room).emit("getMessage", `${data.name}: ${data.msg}`);
    })




    // SIX QUI PREND 
    
    
    socket.on('6update', (username,gameID) => {

      game = findGame(gameID,TaureauGames);
      player = findPlayer(username,game.player_list);

      let redo = false;
      game.player_list.forEach((player) => {

        if(player.deck.length == 0){
          redo = true;
        }

      });

      if(redo){game.croupier()};

      let oppon6 = []
      let pl;
      game.player_list.forEach((player) => {

        pl = {nom : player.name, deck : player.deck.length, score : player.score};
        oppon6.push(pl);

      });


      socket.emit('startTimer');
      socket.emit('Deck',player.deck);
      socket.emit('Row',[game.row1,game.row2,game.row3,game.row4]);
      socket.emit('6oppo',oppon6);
      socket.emit("cartesDroite",game.selected_cards);

      if(game.status == STATUS.PHASE_2){

        socket.emit('phase2',(false));
        socket.emit('nextPlayer',game.currentP);


      }


    });


    socket.on('send6cardphase1', (card,playername,gameID) => {


      game = findGame(gameID,TaureauGames);
      player = findPlayer(playername,game.player_list);



      let count = 0;
      let found = false;
      player.deck.forEach((elem) => {
  
        if(elem.number == card.number){
          found = !found;
        }
        if(!found){
          count++;
        }
  
      });

      if(player.selected != null){

        player.deck.push(player.selected);
        game.selected_cards.splice( game.selected_cards.indexOf(player.selected), 1);

      }

      player.selected = card;
      player.deck.splice(count, 1);
      game.selected_cards.push(card);


      if(game.tousJouer()){

        game.status = STATUS.PHASE_2;
        io.to(gameID).emit('phase2',(false));
        game.GiveOrder();
        io.to(gameID).emit("nextPlayer", game.nextP());

      }

      let oppon6 = []
      let pl;
      game.player_list.forEach((player) => {

        pl = {nom : player.name, deck : player.deck.length, score : player.score};
        oppon6.push(pl);

      });

      socket.emit('Deck',player.deck);
      io.to(gameID).emit('Row',[game.row1,game.row2,game.row3,game.row4]);
      io.to(gameID).emit('6oppo',oppon6);
      io.to(gameID).emit("cartesDroite",game.selected_cards);


    });


    socket.on('send6cardphase2', (row,playername,gameID) => {

      game = findGame(gameID,TaureauGames);
      player = findPlayer(playername,game.player_list);


      if(game.play(parseInt(row))){

        if(game.status == STATUS.ENDED){

          io.to(gameID).emit('FIN', game.winner);
          return;
        }

        player.selected = null;

        if(game.tousPasJouer() || game.status == STATUS.WAITING_FOR_PLAYER_CARD){

          game.selected_cards = [];
          game.status = STATUS.WAITING_FOR_PLAYER_CARD;
          game.clearP();
          io.to(gameID).emit('phase1');

        }

        io.to(gameID).emit("nextPlayer", game.nextP());


      } else {

        socket.emit('missPlacement');

      }




      let oppon6 = []
      let pl;
      game.player_list.forEach((player) => {

        pl = {nom : player.name, deck : player.deck.length, score : player.score};
        oppon6.push(pl);

      });

      socket.emit('Deck',player.deck);
      io.to(gameID).emit('Row',[game.row1,game.row2,game.row3,game.row4]);
      io.to(gameID).emit('6oppo',oppon6);
      io.to(gameID).emit("cartesDroite",game.selected_cards);


    });

    
     // MILLE BORNE BY xX_PROGRAMER69_Xx

  socket.on("MB-whatMyInfo", (data) => {
    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);

    if (player !== 0) {
      socket.emit("MB-playerInfo", { deck: player.deck, nbPoints: player.nbPoints, turn: player.myTurn, bonus: player.bonus, state:player.state, color:player.color, isLimited:player.isLimited });
    }
    else {
      throw new Error("this player didn't exist nooob");
    }
  })

  socket.on("whatTheOrder" , async (data) => {
    let game = findGame(data.serverId, MilleBornesGames);
    let player = findPlayer(data.name, game.playerList);

    if(game.anyonePlayed()){
      game.playerList[0].myTurn = true;
    }

    else {
      console.log("a player is already playing");
    }

    socket.emit("myTurn", player.myTurn);
  })

  socket.on("MB-whatMyOpponent", (data) => {
    game = findGame(data.serverId, MilleBornesGames);
    current_player = findPlayer(data.name, game.playerList);
    playerList = game.playerList;

    let opponentList = getOpponent(playerList, current_player);

    socket.emit("MB-opponent", (opponentList));
  })

  socket.on("MB-playCard", (data) => {

    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);
    card = data.card;

    if (game.cardVitesse.includes(card)) {
        game.vitesseCard(card,player);
    }

    else if (game.cartesAttaque.includes(card)) {
      socket.emit("chooseVictim");
      return;
    }

    else if (game.cardBonus.includes(card)) {
      player.addBonus(card);
      game.endAttaque(card,player);
    }

    else if (game.cardContre.includes(card)) {
      game.endAttaque(card, player);
    }

    else {

      throw new Error("this card doesn't exist broh");

    }

    if (!game.cardBonus.includes(card)) {
      game.cardPlayed.push(card);
    }

    if(game.state == "FIN"){
      io.to(data.serverId).emit("MB_FIN", player.name);
    }

    player.deck.splice(player.deck.indexOf(card), 1)

    game.piocher(player);

    game.MB_giveOrder();  
    
    socket.emit("MB-playerInfo", { deck: player.deck, nbPoints: player.nbPoints, turn: player.myTurn, bonus: player.bonus, state:player.state, color:player.color, isLimited:player.isLimited });
    io.to(data.serverId).emit("getUpdate");
    io.to(data.serverId).emit("updateMiddleCard", ({ card: card }));

  })

  socket.on("victim", (data) => {
    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);
    playerAttacked = findPlayer(data.playerAttackedName, game.playerList);
    if (playerAttacked !== 0) {
      if (game.attaqued(playerAttacked, data.card)) {

        player.deck.splice(player.deck.indexOf(card), 1)
        game.cardPlayed.push(card);

        game.piocher(player);

        game.MB_giveOrder();

        io.to(data.serverId).emit("attacked", playerAttacked.name);
        socket.emit("MB-playerInfo", { deck: player.deck, nbPoints: player.nbPoints, turn: player.myTurn, bonus: player.bonus, state:player.state, color:player.color, isLimited:player.isLimited });
        io.to(data.serverId).emit("getUpdate");
        io.to(data.serverId).emit("updateMiddleCard", ({ card: card }));
      }

      else {
        console.log("can't attack this noob BOZO");
      }
    }
    else {
      throw new Error("le joueuer attaquÃ© n'existe pas big noob");
    }
  })

  socket.on("MB-whatMyState", (data) => {
    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);

    socket.emit("newState", (player.state));
  })

  socket.on("throwCard", (data) => {

    player.deck.splice(player.deck.indexOf(card), 1)
    game.cardPlayed.push(card);
    game.piocher(player);
    game.MB_giveOrder();
    socket.emit("MB-playerInfo", { deck: player.deck, nbPoints: player.nbPoints, turn: player.myTurn, bonus: player.bonus, state:player.state, color:player.color, isLimited:player.isLimited });
    io.to(data.serverId).emit("getUpdate");
    io.to(data.serverId).emit("updateMiddleCard", ({ card: data.card }));

  })

  socket.on("MB-nbCard", (serverId) => {
    game = findGame(serverId, MilleBornesGames);
    socket.emit("MB-getNbCards", game.deck.length);
  })

  socket.on("whatMyTurn", (data) => {
    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);

    socket.emit("myTurn", player.myTurn);
  })

  socket.on('MB-leaveGame', (data) => {

    let game = findGame(data.serverId, MilleBornesGames);
    let player = findPlayer(data.name, game.playerList);

    
    game.removePlayer(player);
    io.to(data.serverId).emit('getUpdate', game);
    
    if(game.playerList.length === 1){
      game.state = GameState.FIN;
      io.to(data.serverId).emit("MB_FIN", player.name);
    }

  });
  
  // FIN  MILLE BORNE BY xX_PROGRAMER69_Xx

});

