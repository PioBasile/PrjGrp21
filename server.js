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
  SixQuiPrend

} = require("./JS_CustomLib/D_utils.js");
const { login, changeDataBase, get_user_info, register } = require("./JS_CustomLib/D_db.js");



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
let lobbyList = [];
let lobbyIndex = 0;

//

server.listen(3001, () =>{
    console.log("SERVER IS RUNNING");
})

io.on('connection', (socket) => {

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

      } else {

        nGame = new Bataille(lobbyID,lobby.nbPlayerMax,lobby.maxTurn,owner,plist);
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

      let oppon6 = []
      let pl;
      game.player_list.forEach((player) => {

        pl = {nom : player.name, deck : player.deck.length, score : player.score};
        oppon6.push(pl);

      });

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

});


