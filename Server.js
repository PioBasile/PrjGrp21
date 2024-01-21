const express = require('express');
const app = express();
const http = require('http');
const {Server} = require("socket.io");
const cors = require("cors");
const { start } = require('repl');
const { platform } = require('os');
const roomName = "room"

// CUSTOM LIB
import * as ddb from "./JS_CustomLib/D_db.js";
import * as dclass from "./JS_CustomLib/D_class.js"
import * as dutils from "./JS_CustomLib/D_utils.js"


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
let availableGames = [];

let lobbyList = [];
let lobbyIndex = 0;

//

server.listen(3001, () =>{
    console.log("SERVER IS RUNNING");
})

io.on('connection', (socket) => {

    console.log("connection");


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

        Nlobby = new Lobby(serverName, parseInt(nbPlayerMax), isPrivate, password, gameType, lobbyIndex, owner);
        lobbyList.push(Nlobby);
        lobbyIndex++;
        io.emit('newServer', lobbyList);

    });

    socket.on('joinLobby',(name,lobbyID,cookie) => {

      clobby = findLobby(lobbyID);
      cplayer = new WaitingPlayer(name,cookie);
      clobby.playerList.push(cplayer);
      io.emit('newServer', lobbyList);

    });

    socket.on('whoIsHere', (lobbyID) => {

      clobby = findLobby(lobbyID);
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

      let clobby = findLobby(lobbyID);
      socket.emit('here', clobby);
      io.to(lobbyID).emit('here', clobby);

    });

    socket.on('ready', (lobbyID,name)=> {

      let clobby = findLobby(lobbyID);
      let cplayer = findWaitingPlayer(name,clobby.playerList);

      cplayer.isReady = !cplayer.isReady;
      socket.emit('here', clobby);
      io.to(lobbyID).emit('here', clobby);



    });

    socket.on('deco_lobby', (lobbyID, name) => {

      let clobby = findLobby(lobbyID);
      let cplayer = findWaitingPlayer(name,clobby.playerList);

      clobby.playerList.splice(clobby.playerList.indexOf(cplayer),1)
      io.to(lobbyID).emit('here', clobby);
      io.to(lobbyID).emit('disconected', name);
      io.emit('newServer', lobbyList);

    });

    socket.on('updateParam', (lobbyID, maxPlayers, timeBetweenTurn, roundsMax) => {

      let clobby = findLobby(lobbyID);

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





    // JEU 

      // PHASE 1 : Distribution des cartes a tout les joueurs //

    socket.on('WhatIsMyDeck', (username,gameID) => {

      game = findGame(gameID);
      player = findPlayer(username,game.playerList);

      socket.emit('Deck',player.deck);

    });

    socket.on('StartGame', (lobbyID) => {

      lobby = findLobby(lobbyID);
      owner = lobby.owner;
      let plist = [];

      lobby.playerList.forEach((player) => {

        plist.push(new Players(player.username,player.cookie))

        get_user_info(player.username).then((res) => {

          console.log(res);
          console.log(player.username);
          changeDataBase('nbGames',res.nbGames + 1,player.username);
      
        });

      });

      let nGame = new Game(lobbyID,lobby.nbPlayerMax,lobby.maxTurn,owner,plist);
      availableGames.push(nGame);

      io.to(lobbyID).emit('start');
      nGame.status = STATUS.WAITING_FOR_PLAYER_CARD;


    });

    socket.on('askGameInfo', (GameID) => {

      game = findGame(GameID);
      socket.emit('getInfo', game);

    });

      // Phase de choix, permet au joueurs de choisir leurs cartes et une fois tout les cartes chosis donne le résultat du round //
    socket.on('PhaseDeChoix', (GameId, playerName, card) => {

      let game = findGame(GameId);
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

              console.log(res);
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

      let game = findGame(GameId);
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

              console.log(res);
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

      let game = findGame(GameId);
      let player = findPlayer(playerName,game.playerList);

      game.removePlayer(player);
      io.to(GameId).emit('getInfo', game);


    });

    socket.on("sendMessage", (data) => {
      console.log(`${data.name}: ${data.msg}`);
      io.to(data.room).emit("getMessage", `${data.name}: ${data.msg}`);
    })

});




//FONCTION


function makecookie(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}


function findGame(id){

    let game = 0;
    availableGames.forEach((elem) => {
      if(elem.identifiant_partie == id){game=elem}
    });
    return game;

}

function findLobby(id){

  let lobby = 0;
  lobbyList.forEach((elem) => {
    if(elem.id == id){lobby=elem}
  });
  return lobby;

}

function findWaitingPlayer(username, plist){

  let player = 0;
  plist.forEach((elem) => {
    if(elem.username == username){player=elem}
  });
  return player;

}


function findPlayer(username, plist){

  let player = 0;
  plist.forEach((elem) => {
    if(elem.name == username){player=elem}
  });
  return player;

}

function generateCartes() {
  const symbols = ['Coeur', 'Carreau', 'Trefle', 'Pique'];
  const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'Reine', 'Roi', 'As'];
  const powers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  const deck = [];
  for (const symbol of symbols) {
    for (let i = 0; i < numbers.length; i++) {
      const card = new Card(symbol, numbers[i], powers[i]);
      deck.push(card);
    }
  }

  return deck;
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  while (currentIndex > 0) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function findCard(card, deck){
  let count = 0;
  let found = false;
  deck.forEach((elem) => {

      if(elem.symbole == card.symbole && elem.power == card.power){
        found = !found;
      }
      if(!found){
        count++;
      }

    });
  return count;
}

function findRemovePlayer(player, plist){
  let count = 0;
  let found = false;
  plist.forEach((elem) => {

      if(elem.name == player.name){
        found = !found;
      }
      if(!found){
        count++;
      }

    });
  return count;
}


