const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const cors = require("cors");
const { start } = require('repl');
const { platform } = require('os');
const roomName = "room"
const fs = require("fs")
const path = require('path');
const rouletteRoomId = 4624
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
  GameState,
  SavedLobby,
  BlackJack,
  BlackJackPlayer
} = require("./JS_CustomLib/D_utils.js");

//DORIAN
const { login, changeDataBase, get_user_info, register } = require("./JS_CustomLib/D_db.js");
const { Roulette } = require("./JS_CustomLib/D_Casino.js");
const { Sentinel_Main } = require('./JS_CustomLib/sentinel.js');
const { getAllScores, changeScoreBoard, changeMoney } = require("./JS_CustomLib/P_db.js");
const { emit } = require('process');
const { on } = require('events');




app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },

});


// VARIABLES 

let validCookies = {};
let BatailGames = [];
let TaureauGames = [];
let MilleBornesGames = [];
let lobbyList = [];
let PresidentGames = [];
let BlackJackGames = [];
let lobbyIndex = 1;
let RouletteInstance = new Roulette();
let isPaused = false;

setInterval(() => { Sentinel_Main(io, validCookies, BatailGames, TaureauGames, MilleBornesGames, lobbyList, lobbyIndex) }, 100);


//

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
})


const updateWins = async () => {
  for (const win of RouletteInstance.wins) {
    try {
      const res = await get_user_info(win["name"]);
      await changeDataBase("argent", res.argent + win["won"], win["name"]);
      await changeMoney(win["name"], win["won"]);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des gains :", error);
    }
  }
}

setInterval(() => {

  if (isPaused) {
    return
  }

  RouletteInstance.timer = RouletteInstance.timer - 1;

  if (RouletteInstance.timer == 0) {

    RouletteInstance.rolls();
    io.to(rouletteRoomId).emit('spinwheel', RouletteInstance.roll);
    RouletteInstance.resolveBets();

    updateWins();

    io.to(rouletteRoomId).emit("listWins", RouletteInstance.wins);

    RouletteInstance.wins = [];
    RouletteInstance.bets = [];

    isPaused = true;
    setTimeout(() => {
      isPaused = false;
    }, 9000);

    RouletteInstance.timer = 30;

  }
  io.emit('rouletteTimer', RouletteInstance.timer);
}, 1000);

setInterval(() => { io.emit('timerDown'); }, 1000);


io.on('connection', (socket) => {

  // --------------------------------------Casino-------------------------------------------------------

  socket.on("bet", (nom, betAmmount, betPos) => {

    if (betAmmount <= 0) {
      return
    }

    if (RouletteInstance.timer > 5) {

      RouletteInstance.bets.push({ nom: nom, betAmmount: betAmmount, betPos: betPos });
      get_user_info(nom).then((res) => {

        changeDataBase("argent", res.argent - betAmmount, nom);
        changeMoney(nom, -betAmmount);
        socket.emit("VoilaTesSousMonSauce", res.argent - betAmmount);

      });


    }
    else {

      socket.emit("tropsTard");

    }

    io.to(rouletteRoomId).emit("bets", RouletteInstance.bets);

  });

  socket.on("rouletteConnection", () => {
    socket.join(rouletteRoomId);
  })

  socket.on("leaveRoulette", () => {
    socket.leave(rouletteRoomId);
  })

  socket.on("ArgentViteBatard", (name) => {

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

    login(username, password).then((value) => {
      if (value == 1) {
        cookie = makecookie(10);
        socket.emit('succes', cookie, username);
        validCookies[username] = cookie;
      } else {
        socket.emit('failure');
      }
    });

  });

  socket.on('register', (username, password) => {

    register(username, password).then((value) => {
      if (value == 1) {
        cookie = makecookie(10);
        socket.emit('succes', cookie, username);
        validCookies[username] = cookie;
      } else {
        socket.emit('failure');
      }
    });

  });


  // GESTION LOBBY //

  socket.on('newServer', (serverName, nbPlayerMax, isPrivate, password, gameType, owner, moneyBet) => {

    let Nlobby = new Lobby(serverName, parseInt(nbPlayerMax), isPrivate, password, gameType, lobbyIndex, owner, moneyBet);

    lobbyList.push(Nlobby);
    lobbyIndex++;
    io.emit('newServer', lobbyList);
  });

  socket.on("recreateNewServer", (fileName) => {
    fs.readFile(`saves/${fileName}.json`, 'utf8', (err, data) => {
      if (err) {
        console.error("Impossible de lire le fichier :", err);
        return;
      }

      const gameData = JSON.parse(data);

      let lobbyData = gameData["lobbyLinked"]
      let Nlobby = new Lobby(lobbyData["serverName"], lobbyData["nbPlayerMax"], lobbyData["isPrivate"], lobbyData["password"], lobbyData["gameType"], lobbyData["id"], lobbyData["owner"], lobbyData["moneyBet"])

      Nlobby.gameLinked = gameData;
      lobbyList.push(Nlobby);
      lobbyIndex++;
      io.emit('newServer', lobbyList);
    });


  })

  socket.on('joinLobby', (name, lobbyID, cookie) => {

    clobby = findLobby(lobbyID, lobbyList);
    cplayer = new Player_IN_Lobby(name, cookie);
    clobby.playerList.push(cplayer);
    clobby.is_empty = false;
    io.emit('newServer', lobbyList);

  });

  socket.on('whoIsHere', (lobbyID) => {

    clobby = findLobby(lobbyID, lobbyList);
    io.emit('update', clobby.playerList);

  });

  socket.on('join', (room) => {

    socket.join(room);

  });



  socket.on("getServ", () => {

    socket.emit('newServer', lobbyList);

  });

  socket.on('WhereAmI', (lobbyID) => {

    let clobby = findLobby(lobbyID, lobbyList);
    socket.emit('here', clobby);
    io.to(lobbyID).emit('here', clobby);

  });

  socket.on('ready', (lobbyID, name) => {

    let clobby = findLobby(lobbyID, lobbyList);
    let cplayer = findWaitingPlayer(name, clobby.playerList);

    cplayer.isReady = !cplayer.isReady;
    socket.emit('here', clobby);
    io.to(lobbyID).emit('here', clobby);



  });

  socket.on('deco_lobby', (lobbyID, name) => {

    let clobby = findLobby(lobbyID, lobbyList);
    let cplayer = findWaitingPlayer(name, clobby.playerList);
    if (cplayer == -1) {
      socket.emit("deco");
      return;
    }

    clobby.playerList.splice(clobby.playerList.indexOf(cplayer), 1)
    io.to(lobbyID).emit('here', clobby);
    io.to(lobbyID).emit('disconected', name);
    io.emit('newServer', lobbyList);

  });

  socket.on('updateParam', (lobbyID, maxPlayers, timeBetweenTurn, roundsMax) => {

    let clobby = findLobby(lobbyID, lobbyList);

    clobby.nbPlayerMax = parseInt(maxPlayers);
    clobby.tbt = parseInt(timeBetweenTurn);
    clobby.maxTurn = parseInt(roundsMax);

    io.emit('newServer', lobbyList);
    io.to(lobbyID).emit('lobbyParams', maxPlayers, timeBetweenTurn, roundsMax,);

  });

  socket.on("lobbyInfo_UwU", (serverId) => {
    let lobby = findLobby(serverId, lobbyList);
    io.to(serverId).emit("yourInfoBebs", { serverName: lobby.serverName, nbPlayerMax: lobby.nbPlayerMax, password: lobby.password, gameType: lobby.gameType, owner: lobby.owner, timer: lobby.tbt, moneyBet: lobby.moneyBet });
  })

  socket.on('askStat', (name) => {

    get_user_info(name).then((res) => {

      socket.emit('stats', res);

    });

  });


  socket.on('StartGame', (lobbyID) => {


    let lobby = findLobby(lobbyID, lobbyList);
    let owner = lobby.owner;
    let plist = [];


    lobby.playerList.forEach((player) => {

      plist.push(new Player(player.username, player.cookie))

      get_user_info(player.username).then((res) => {

        changeDataBase('nbGames', res.nbGames + 1, player.username);

      });

    });

    let nGame;

    if (lobby.gameType == "rd") {
      let game = ["batailleOuverte", "sqp", "mb"]
      let randomId = Math.floor(Math.random() * 2)
      lobby.gameType = game[randomId];
    }

    if (lobby.gameType == "sqp") {

      nGame = new SixQuiPrend(lobby.serverName, lobbyID, owner, plist, 10, lobby.moneyBet, lobby.nbPlayerMax);

      const lobbyNotChanged = Object.assign({}, lobby);
      nGame.lobbyLinked = lobbyNotChanged;

      TaureauGames.push(nGame);

    }

    else if (lobby.gameType == "mb") {

      let mbPlist = [];

      let color = ["pink", "red", "yellow", "green"];

      plist.forEach((player, index) => {
        let newMB_player = new MB_Player(player.name, player.cookie, color[index]);
        mbPlist.push(newMB_player);
      })
      plist = mbPlist;
      nGame = new MilleBorne(lobbyID, owner, mbPlist, lobby.moneyBet, lobby.nbPlayerMax);

      const lobbyNotChanged = Object.assign({}, lobby);

      nGame.lobbyLinked = lobbyNotChanged;

      MilleBornesGames.push(nGame);
    }

    else if (lobby.gameType == "blackjack") {
      let bjList = []
      plist.forEach((player, index) => {
        let newBJ_player = new BlackJackPlayer(player.name, player.cookie);
        bjList.push(newBJ_player);
      })

      plist = bjList;
      nGame = new BlackJack(lobbyID, lobby.nbPlayerMax, owner, plist);
      const lobbyNotChanged = Object.assign({}, lobby);
      nGame.lobbyLinked = lobbyNotChanged;

      BlackJackGames.push(nGame);
    }


    else {
      nGame = new Bataille(lobbyID, lobby.nbPlayerMax, lobby.maxTurn, owner, plist, lobby.moneyBet);
      BatailGames.push(nGame);

      const lobbyNotChanged = Object.assign({}, lobby);
      nGame.lobbyLinked = lobbyNotChanged;

    }

    io.to(lobbyID).emit('start', lobby.gameType);
    nGame.status = STATUS.WAITING_FOR_PLAYER_CARD;


    if (lobby.gameLinked) {
      nGame.recreate(lobby.gameLinked);
    }

    for (let player of plist) {
      get_user_info(player.name).then((res) => {
        changeMoney(player.name, -lobby.moneyBet); // on leur enleve leur thune dés qu'ils entrent dans la game
        changeDataBase('nbWin', res.nbGames + 1, player.name);
        changeDataBase('argent', res.argent - lobby.moneyBet, player.name);
      });

    }

  });


  // JEU BATAILLE FLORIAN

  // PHASE 1 : Distribution des cartes a tout les joueurs //

  socket.on('WhatIsMyDeck', (username, gameID) => {

    game = findGame(gameID, BatailGames);
    player = findPlayer(username, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }

    socket.emit('Deck', player.deck);

  });


  socket.on("sendEmoteToLobby", (data) => {
    io.to(data.serverId).emit("emote", data.emote, data.playerName);
  })

  socket.on("endEmote", (serverId) => {
    io.to(serverId).emit("endEmoteToAll")
  })

  socket.on('askGameInfo', (GameID) => {

    game = findGame(GameID, BatailGames);
    socket.emit('getInfo', game);

  });

  socket.on("loadCardsPlayed", (serverId) => {
    let game = findGame(serverId, BatailGames);
    socket.emit("roundCardsPlayed", game.cardPlayedInRound);
  })

  socket.on("playCard", (serverId, card, playerName) => {
    let game = findGame(serverId, BatailGames)
    let player = findPlayer(playerName, game.playerList);
    if (game.cardPlayedInRound.hasOwnProperty(playerName)) {
      player.switchCard(card);
    }
    else {
      player.selected = card;
      player.removeCard(card);
    }
    game.cardPlayedInRound[player.name] = card;
    io.to(serverId).emit("yourDeck");
    io.to(serverId).emit("roundCardsPlayed", game.cardPlayedInRound);
    if (game.allPlayerPlayed()) {

      if (game.isADraw()) {
        socket.emit("resolveDrawAsk");
        io.to(serverId).emit("canPlay?", false);
      }

      else {
        socket.emit("resolveRoundAsk");
        io.to(serverId).emit("canPlay?", false);
      }
      io.to(serverId).emit("showAll?");
      let winners = game.findGameWinner();
      if (winners) {
        let moneyWin = Math.round(game.moneyBet * game.maxJoueurs / winners.length);
        winners.forEach((name) => {
          get_user_info(name).then((res) => {
            changeDataBase('nbWin', res.nbWin + 1, name);
            changeScoreBoard('bataille-ouverte', name);
            changeDataBase('argent', res.argent + 100 + moneyWin, name);
            changeMoney(name, 100 + moneyWin);
          });

        });
        game.status = STATUS.ENDED;
        socket.emit("fin", winners)
      }
      else {
        game.currentTurn += 1
      }
    }
    else {
      player.removeCard(card);
      io.to(serverId).emit("yourDeck");
    }
  })

  socket.on("resetCardSelected", (serverId) => {
    game = findGame(serverId, BatailGames);
    game.cardPlayedInRound = {};
    io.to(serverId).emit("roundCardsPlayed", game.cardPlayedInRound);
  })

  socket.on("resolveRound", (serverId, _) => {
    let game = findGame(serverId, BatailGames);
    let allCardPlayed = Object.values(game.cardPlayedInRound);
    let winner = game.findWinner(game.playerList);
    winner.deck = [...winner.deck, ...allCardPlayed];
    game.changeScoreBoard(winner.name);
    io.to(serverId).emit("yourDeck");
    game.restartRound();
    io.to(serverId).emit("getInfo", game);
    io.to(serverId).emit("roundCardsPlayed", game.cardPlayedInRound);
    io.to(serverId).emit("canPlay?", true);
    io.to(serverId).emit("reset");
    io.to(serverId).emit("roundWinner", winner.name);
  })


  socket.on("resolveDrawFirstPart", (serverId) => {
    let game = findGame(serverId, BatailGames);
    game.resolveDrawFirstPart()
    io.to(serverId).emit("yourDeck");
    io.to(serverId).emit("roundCardsPlayed", game.cardPlayedInRound);
    socket.emit("resolveDrawAfter");
  })

  socket.on("resolveDraw", (serverId) => {
    let game = findGame(serverId, BatailGames);
    let playersInDraw = game.findPlayerWasInDraw()
    let winner = game.findWinner(playersInDraw);
    game.changeScoreBoard(winner.name);
    game.resolveDraw(winner);
    io.to(serverId).emit("yourDeck");
    game.restartRound();
    io.to(serverId).emit("getInfo", game);
    io.to(serverId).emit("reset")
    io.to(serverId).emit("roundWinner", winner.name);
  })

  socket.on("whatMyDeck", (serverId, playerName) => {
    let game = findGame(serverId, BatailGames)
    let player = findPlayer(playerName, game.playerList)
    socket.emit("Deck", player.deck);
  })

  socket.on("showAllAsk", (serverId) => {

    io.to(serverId).emit("showAll");
  })

  socket.on("BTL-leaveGame", (playerName, serverId) => {
    let game = findGame(serverId, BatailGames);
    let player = findPlayer(playerName, game.playerList);
    game.removePlayer(player)
    let winners = game.findGameWinner();
    if (winners) {
      if (winners.length != 0) {
        var moneyWin = Math.round(game.moneyBet * game.maxJoueurs / winners.length)
      }

      winners.forEach((name) => {
        get_user_info(name).then((res) => {
          changeDataBase('nbWin', res.nbWin + 1, name);
          changeScoreBoard('bataille-ouverte', name);
          changeDataBase('argent', res.argent + 100 + moneyWin, name);
          changeMoney(name, 100 + moneyWin);
        });

      });
      game.status = STATUS.ENDED;
      io.to(serverId).emit("fin", winners);
    }

    else {
      io.to(serverId).emit("getInfo", game);
    }
  })

  // SIX QUI PREND DORIAN


  socket.on('6update', (username, gameID) => {


    game = findGame(gameID, TaureauGames);
    player = findPlayer(username, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }

    let redo = false;
    game.playerList.forEach((player) => {

      if (player.deck.length == 0) {
        redo = true;
      }

    });

    if (redo) { game.croupier() };

    let oppon6 = []
    let pl;
    game.playerList.forEach((player) => {

      pl = { nom: player.name, deck: player.deck.length, score: player.score };
      oppon6.push(pl);

    });


    socket.emit('startTimer');
    socket.emit('Deck', player.deck);
    socket.emit('Row', [game.row1, game.row2, game.row3, game.row4]);
    socket.emit('6oppo', oppon6);
    socket.emit("cartesDroite", game.selected_cards);

    if (game.status == STATUS.PHASE_2) {

      socket.emit('phase2', (false));
      socket.emit('nextPlayer', game.currentP);


    }


  });


  socket.on('send6cardphase1', (card, playername, gameID) => {


    game = findGame(gameID, TaureauGames);
    player = findPlayer(playername, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }



    let count = 0;
    let found = false;
    player.deck.forEach((elem) => {

      if (elem.number == card.number) {
        found = !found;
      }
      if (!found) {
        count++;
      }

    });

    if (player.selected != null) {

      player.deck.push(player.selected);
      game.selected_cards.splice(game.selected_cards.indexOf(player.selected), 1);

    }

    player.selected = card;
    player.deck.splice(count, 1);
    game.selected_cards.push(card);


    if (game.tousJouer()) {

      game.status = STATUS.PHASE_2;
      io.to(gameID).emit('phase2', (false));
      game.GiveOrder();
      io.to(gameID).emit("nextPlayer", game.nextP());

    }

    let oppon6 = []
    let pl;
    game.playerList.forEach((player) => {

      pl = { nom: player.name, deck: player.deck.length, score: player.score };
      oppon6.push(pl);

    });

    socket.emit('Deck', player.deck);
    io.to(gameID).emit('Row', [game.row1, game.row2, game.row3, game.row4]);
    io.to(gameID).emit('6oppo', oppon6);
    io.to(gameID).emit("cartesDroite", game.selected_cards);


  });


  socket.on('send6cardphase2', (row, playername, gameID) => {

    let game = findGame(gameID, TaureauGames);
    let player = findPlayer(playername, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }


    if (game.play(parseInt(row))) {

      if (game.status == STATUS.ENDED) {
        if (game.moneyBet >= 0) {
          let moneyWin = game.moneyBet
          let winner = game.Pgagnat();
          let winnerName = winner.name;
          console.log("AND THE WINNNNER IIIIIIISSS!!!!!!!! ",winnerName)
          get_user_info(player.name).then((res) => {

            changeDataBase('nbWin', res.nbWin + 1, winnerName);
            changeScoreBoard('six-qui-prend', winnerName);
            changeDataBase('argent', res.argent + 100 + moneyWin,winnerName);
            changeMoney(player.name, 100 + moneyWin);

          });
        }
        else {
          console.log("WESH CHELOU DE MALADE MA PUPUCE");
        }
        io.to(gameID).emit('FIN', game.winner);
        return;
      }

      player.selected = null;

      if (game.tousPasJouer() || game.status == STATUS.WAITING_FOR_PLAYER_CARD) {

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
    game.playerList.forEach((player) => {

      pl = { nom: player.name, deck: player.deck.length, score: player.score };
      oppon6.push(pl);

    });

    socket.emit('Deck', player.deck);
    io.to(gameID).emit('Row', [game.row1, game.row2, game.row3, game.row4]);
    io.to(gameID).emit('6oppo', oppon6);
    io.to(gameID).emit("cartesDroite", game.selected_cards);


  });

  socket.on("thisIsThePlayerWhoPlayed", (playerName, serverId) => {
    io.to(serverId).emit("playerWhosPlaying", playerName);
  })

  socket.on("SQP-leaveGame", (playerName, serverId) => {
    let game = findGame(serverId, TaureauGames);
    let player = findPlayer(playerName, game.playerList);
    game.removePlayer(player)
    let winner = game.playerList[0];

    if (game.playerList.length == 1) {
      if (winner) {
        var moneyWin = Math.round(game.moneyBet * game.maxPlayer);
        get_user_info(winner.name).then((res) => {
          changeDataBase('nbWin', res.nbWin + 1, winner.name);
          changeScoreBoard('six-qui-prend', winner.name);
          changeDataBase('argent', res.argent + 100 + moneyWin, winner.name);
          changeMoney(winner.name, 100 + moneyWin);
        });
        game.status = STATUS.ENDED;
        io.to(serverId).emit('FIN', winner);
      }
    }

  })


  // MILLE BORNE BY FLORIAN


  socket.on("MB-whatMyInfo", (data) => {

    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }

    if (player !== 0) {
      socket.emit("MB-playerInfo", { deck: player.deck, nbPoints: player.nbPoints, turn: player.myTurn, bonus: player.bonus, state: player.state, color: player.color, isLimited: player.isLimited });
    }
    else {
      throw new Error("this player didn't exist nooob");
    }
  })

  socket.on("whatTheOrder", async (data) => {
    let game = findGame(data.serverId, MilleBornesGames);
    let player = findPlayer(data.name, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }

    if (game.anyonePlayed()) {
      game.playerList[0].myTurn = true;
    }


    socket.emit("myTurn", player.myTurn);
  })

  socket.on("MB-whatMyOpponent", (data) => {
    game = findGame(data.serverId, MilleBornesGames);
    current_player = findPlayer(data.name, game.playerList);
    if (current_player == -1) {
      socket.emit("deco");
      return;
    }
    playerList = game.playerList;

    let opponentList = getOpponent(playerList, current_player);

    socket.emit("MB-opponent", (opponentList));
  })

  socket.on("MB-playCard", (data) => {

    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }
    card = data.card;

    if (game.cardVitesse.includes(card)) {
      game.vitesseCard(card, player);
    }

    else if (game.cartesAttaque.includes(card)) {
      socket.emit("chooseVictim");
      return;
    }

    else if (game.cardBonus.includes(card)) {
      player.addBonus(card);
      game.endAttaque(card, player);
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

    if (game.state == "FIN") {
      io.to(data.serverId).emit("MB_FIN", player.name);
      let moneyWin = Math.round(game.moneyBet * game.maxPlayers)

      console.log("game.maxPlayer");
      console.log(game.maxPlayer);

      console.log("game.moneyBet");
      console.log(game.moneyBet);
      
      get_user_info(player.name).then((res) => {

        changeDataBase('nbWin', res.nbWin + 1, player.name);
        changeDataBase('argent', res.argent + 100 + moneyWin, player.name);

        changeScoreBoard('mille-bornes', player.name);
        changeMoney(player.name, 100 + moneyWin);
      });

    }

    player.deck.splice(player.deck.indexOf(card), 1)

    game.piocher(player);

    game.MB_giveOrder();

    socket.emit("MB-playerInfo", { deck: player.deck, nbPoints: player.nbPoints, turn: player.myTurn, bonus: player.bonus, state: player.state, color: player.color, isLimited: player.isLimited });
    io.to(data.serverId).emit("getUpdate");
    io.to(data.serverId).emit("updateMiddleCard", ({ card: card }));

  })

  socket.on("victim", (data) => {
    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }
    playerAttacked = findPlayer(data.playerAttackedName, game.playerList);
    if (playerAttacked == -1) {
      socket.emit("deco");
      return;
    }
    if (playerAttacked !== 0) {
      if (game.attaqued(playerAttacked, data.card)) {

        player.deck.splice(player.deck.indexOf(card), 1)
        game.cardPlayed.push(card);

        game.piocher(player);

        game.MB_giveOrder();

        io.to(data.serverId).emit("attacked", playerAttacked.name);
        socket.emit("MB-playerInfo", { deck: player.deck, nbPoints: player.nbPoints, turn: player.myTurn, bonus: player.bonus, state: player.state, color: player.color, isLimited: player.isLimited });
        io.to(data.serverId).emit("getUpdate");
        io.to(data.serverId).emit("updateMiddleCard", ({ card: card }));
      }


    }
    else {
      throw new Error("le joueuer attaquÃ© n'existe pas big noob");
    }
  })

  socket.on("MB-whatMyState", (data) => {
    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }

    socket.emit("newState", (player.state));
  })

  socket.on("throwCard", (data) => {

    player.deck.splice(player.deck.indexOf(card), 1)
    game.cardPlayed.push(card);
    game.piocher(player);
    game.MB_giveOrder();
    socket.emit("MB-playerInfo", { deck: player.deck, nbPoints: player.nbPoints, turn: player.myTurn, bonus: player.bonus, state: player.state, color: player.color, isLimited: player.isLimited });
    io.to(data.serverId).emit("getUpdate");
    io.to(data.serverId).emit("updateMiddleCard", ({ card: data.card }));

  })

  socket.on("MB-nbCard", (serverId) => {
    game = findGame(serverId, MilleBornesGames);
    if (game) socket.emit("MB-getNbCards", game.deck.length);
    else socket.emit("deco")
  })

  socket.on("whatMyTurn", (data) => {
    game = findGame(data.serverId, MilleBornesGames);
    player = findPlayer(data.name, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }

    socket.emit("myTurn", player.myTurn);
  })

  socket.on("whatMyColor", (serverId, name) => {
    game = findGame(serverId, MilleBornesGames);
    player = findPlayer(name, game.playerList);
    socket.emit("yourColor", player.color)
  })

  socket.on('MB-leaveGame', (data) => {

    let game = findGame(data.serverId, MilleBornesGames);
    let player = findPlayer(data.name, game.playerList);
    if (player == -1) {
      socket.emit("deco");
      return;
    }


    game.removePlayer(player);
    io.to(data.serverId).emit('getUpdate', game);

    if (game.playerList.length == 1) {
      game.state = GameState.FIN;
      io.to(data.serverId).emit("MB_FIN", player.name);
      player = game.playerList[0];
      get_user_info(player.name).then((res) => {

        changeDataBase('nbWin', res.nbWin + 1, player.name);
        changeDataBase('argent', res.argent + 100, player.name);

        changeScoreBoard('mille-bornes', player.name);
        changeMoney(player.name, 100);
      });
    }
  });

  //CHAT FOR ALL !!!!!!! DORIAN STP NE SUPPRIME PAS !!!!! (TOUT CE QU'IL YA EN DESSOUS => FLORIAN)

  function isGlobal(msg) {
    let messageGlobalType = "<global>"
    if (msg.length < messageGlobalType.length) {
      return false;
    }
    return msg.toLowerCase().startsWith(messageGlobalType)
  }

  socket.on("sendMessage", (data) => {
    lobby = findLobby(data.serverId, lobbyList);
    if (lobby.gameType == "batailleOuverte") {
      game = findGame(data.serverId, BatailGames);
    }
    else if (lobby.gameType == "sqp") {
      game = findGame(data.serverId, TaureauGames);
    }
    else if (lobby.gameType == "mb") {
      game = findGame(data.serverId, MilleBornesGames)
    }

    else if (lobby.gameType == "blackjack") {
      game = findGame(data.serverId, BlackJackGames);
    }

    else {
      throw new Error(" womp womp aucun jeu connu sous ce nom: ", lobby.gameType);
    }

    if (data.msg) {
      if (!isGlobal(data.msg)) {
        game.addMessage(`<local> ${data.name}: ${data.msg}`);
        io.to(data.serverId).emit("getMessage", game.chatContent);
      }
      else {
        data.msg = data.msg.replace("<global>", "");
        for (let btlGame of BatailGames) {
          btlGame.addMessage(` 🌐 > ${data.name}: ${data.msg}`)
          io.emit("getMessage", btlGame.chatContent);
        }
        for (let mbGame of MilleBornesGames) {
          mbGame.addMessage(` 🌐 > ${data.name}: ${data.msg}`)
          io.emit("getMessage", mbGame.chatContent);
        }
        for (let sqpGame of TaureauGames) {
          sqpGame.addMessage(` 🌐 > ${data.name}: ${data.msg}`)
          io.emit("getMessage", sqpGame.chatContent);
        }
        for (let bjGame of BlackJackGames) {
          bjGame.addMessage(` 🌐 > ${data.name}: ${data.msg}`)
          io.emit("getMessage", bjGame.chatContent);
        }
      }
    }
  })

  socket.on("whaIsOwner", (serverId) => {
    lobby = findLobby(serverId, lobbyList);
    socket.emit("owner", lobby.owner);
  })

  socket.on("loadTheChat", (serverId) => {
    lobby = findLobby(serverId, lobbyList);
    if (lobby.gameType == "batailleOuverte") {
      game = findGame(serverId, BatailGames);
    }
    else if (lobby.gameType == "sqp") {
      game = findGame(serverId, TaureauGames);
    }
    else if (lobby.gameType == "mb") {
      game = findGame(serverId, MilleBornesGames);
    }
    else if (lobby.gameType == "blackjack") {
      game = findGame(serverId, BlackJackGames);
    }
    else {
      socket.emit("deco")
    }

    io.to(serverId).emit("getMessage", game.chatContent)
  })

  socket.on("rlt-sendMessage", (data) => {
    if (data.msg == "/giveMoney 1000") {
      get_user_info(data.name).then((res) => {
        changeDataBase('argent', res.argent + 1000, data.name);
        changeMoney(data.name, 1000);
      });
    }
    else {
      RouletteInstance.addMessage(`${data.name} : ${data.msg}`);
      io.emit("rlt-getMessage", RouletteInstance.chatContent);
    }
  })

  socket.on("rlt-loadTheChat", () => {
    io.emit("rlt-getMessage", RouletteInstance.chatContent)
  })





  function readSaveDir() {
    const dossier = "./saves/"
    fs.readdir(dossier, (err, files) => {
      if (err) {
        console.error("PROBLEM !!! :", err);
        return;
      }

      const jsonFile = files.filter(file => file.endsWith('.json'));

      const fileNameSave = jsonFile.map(file => path.parse(file).name);
      socket.emit("newGameSaved", fileNameSave)
    });
  }

  socket.on("saveGame", (serverId, saveName, playerName) => {
    let lobby = findLobby(serverId, lobbyList);
    if (lobby.gameType == "batailleOuverte") {
      console.log("lets save some bataille ouverte")
      game = findGame(serverId, BatailGames);
    }
    else if (lobby.gameType == "sqp") {
      console.log("lets save a game qsp");
      game = findGame(serverId, TaureauGames);
    }
    else if (lobby.gameType == "mb") {
      console.log("herer2")
      game = findGame(serverId, MilleBornesGames)
    }
    else {
      throw new Error("aucun jeu connu sous ce nom: ", lobby.gameType);
    }

    game.serverName = saveName;
    game.lobbyLinked["serverName"] = saveName;

    const gameSave = JSON.stringify(game);

    fs.writeFile(`saves/${playerName}_${saveName}_${lobby.gameType}.json`, gameSave, (err) => {
      if (err) throw err;
    });

    readSaveDir();
  })

  socket.on("whatGameSaved", () => {
    readSaveDir()
  })


  socket.on("deleteFile", (fileName) => {
    fs.unlink(`saves/${fileName}.json`, (err) => {
      if (err) {
        return
      }
      readSaveDir()
    })

  })
  // SENTINEL 
  socket.on("player_auth_validity", (data) => {

    if (data.player_name == "" || validCookies[data.player_name] == "no") { return; }

    if (validCookies[data.player_name] != data.cookie) {
      socket.emit("sentinel_auth_error");
      validCookies[data.player_name] = "no";
    }

  });


  socket.on("buyAGif", (playerName, gif, playerMoney) => {
    if (playerName) {
      fs.readFile('EmotePlayer/EmotesPlayer.json', "utf8", (err, data) => {
        if (err) {
          console.log("erreur de lecture")
          return 0;
        }

        let jsonData = JSON.parse(data);
        if (gif.price < playerMoney) {
          if (jsonData.hasOwnProperty(playerName)) {
            if (!jsonData[playerName].includes(gif.id)) {
              jsonData[playerName].push(gif.id);
            }
            else {
              socket.emit("alreadyGot");
              return;
            }

          }
          else {
            jsonData[playerName] = [gif.id];
          }

          get_user_info(playerName).then((res) => {
            changeDataBase('argent', res.argent - gif.price, playerName);
            changeMoney(playerName, -gif.price);
            socket.emit("stats", res);
          });

          socket.emit("yourEmotes", jsonData[playerName])
        }
        else {
          socket.emit("noMoneyToBuyWompWomp")
        }

        fs.writeFile("EmotePlayer/EmotesPlayer.json", JSON.stringify(jsonData), "utf8", (err) => {
          if (err) {
            console.log("erreur d'écriture");
            return 0;
          }

          console.log("écriture succesfull");
        });
      });

    }
    else {
      throw new Error("playername is " + playerName)
    }
  });


  socket.on("whatsMyEmotes", (playerName) => {

    fs.readFile("EmotePlayer/EmotesPlayer.json", "utf8", (err, data) => {
      if (err) {
        console.log("erreur de lecture")
        return 0;
      }
      let jsonData = JSON.parse(data);
      let playerEmotes = jsonData[playerName];
      socket.emit("yourEmotes", playerEmotes);
    })
  })

  socket.on('askScoreboard', () => {
    getAllScores().then((res) => {
      socket.emit('scoreboard', res);
    });
  });


  socket.on("BJ-allDeckInfo", (serverId) => {
    let game = findGame(serverId, BlackJackGames);


    socket.emit("allDeck", game.playerList);
  })

  socket.on("BJ-whatMyMoney", (name) => {
    get_user_info(name).then((res) => {
      socket.emit("yourMoney", res.argent);
    });
  })



  socket.on("whatsStatus", (serverId) => {
    let game = findGame(serverId, BlackJackGames);
    let status = game.findStatus()
    socket.emit("gameStatus", status);
  })

  socket.on("whatDealerCards", (serverId) => {
    let game = findGame(serverId, BlackJackGames);
    socket.emit("dealerCards", game.dealerCards);
  })

  socket.on("BJ-whatMyTurn", (serverId, playerName) => {
    let game = findGame(serverId, BlackJackGames);
    let player = findPlayer(playerName, game.playerList);

    if (game.anyonePlayed()) {
      game.playerList[0].myTurn = true;
    }

    socket.emit("BJ-myTurn", player.myTurn);
  })

  socket.on("BJ-bet", (serverId, deckNameBet, betAmount, gambler) => {
    let game = findGame(serverId, BlackJackGames);
    let player = findPlayer(deckNameBet, game.playerList);

    player.newBet(betAmount, gambler);

    get_user_info(gambler).then((res) => {
      changeDataBase('argent', res.argent - betAmount, gambler);
      changeMoney(gambler, -betAmount);
    });

    let status = game.findStatus()
    io.to(serverId).emit("askMoney");
    io.to(serverId).emit("gameStatus", status);
    io.to(serverId).emit("allDeck", game.playerList);
    io.to(serverId).emit("BJ-askMyTurn");
  })

  function dealerPlay(game) {
    let sum = game.sumPoint();

    while (sum < 17) {
      game.dealerHit();
      sum = game.sumPoint()
    }
    io.to(game.identifiant_partie).emit("dealerCards", game.dealerCards);



  }

  // évite les répétition dans le code et fait toutes les vérification apres l'action hit 
  // passe au joueur d'apres et si c'est le dernier dit au dealer de jouer

  function afterHit(game, player) {

    const playerPoints = player.sumPoint();

    if (playerPoints >= 21) {
      if (!game.nextPlayer()) {
        dealerPlay(game)
      }
    }
  }



  socket.on("restartRound", (serverId) => {

    let game = findGame(serverId, BlackJackGames);

    game.restartRound();
    io.to(serverId).emit("allDeck", game.playerList)
    io.to(serverId).emit("gameStatus", "bet");
    io.to(serverId).emit("dealerCards", game.dealerCards)

  })


  socket.on("hit", (serverId, deckName) => {

    let game = findGame(serverId, BlackJackGames);
    let player = findPlayer(deckName, game.playerList);

    if (!player.hasSplitted) {

      game.hit(deckName);
      afterHit(game, player);
    }

    else {

      let sumPoint = player.sumPoint();
      let sumPointSplitted = player.sumPointSplitted()
      if(!player.onSplittedDeck){
        if(sumPoint >= 21){
          player.onSplittedDeck = true
        }
        else{
          game.hit(deckName);
        }
      }
      else {
        if(sumPointSplitted >= 21){
          if(!game.nextPlayer()){
            dealerPlay(game);
          }
        }
        else {
          game.hit(deckName);
        }
      }

      // game.hit(deckName);
      // let sumPoint = player.sumPoint();
      // if (sumPoint >= 21) {
      //   if (player.onSplittedDeck) {
      //     player.hasSplitted = false;
      //     if (!game.nextPlayer()) {
      //       player.myTurn = false;
      //       dealerPlay(game)
      //     };
      //   }
      //   else {
      //     player.onSplittedDeck = true;
      //   }
      // }
    }

    io.to(serverId).emit("BJ-askMyTurn");
    io.to(serverId).emit("allDeck", game.playerList);
  })


  socket.on("stay", (serverId, deckName) => {
    let game = findGame(serverId, BlackJackGames) 
    let player = findPlayer(deckName, game.playerList);
    if (!player.hasSplitted) {
      if (!game.nextPlayer()) {
        player.myTurn = false;
        dealerPlay(game)
      };
    }

    else {

      if (player.onSplittedDeck) {

        player.hasSplitted = false;

        if (!game.nextPlayer()) {
          dealerPlay(game);
        };
      }
      else {
        player.onSplittedDeck = true
      }

    }
    io.to(serverId).emit("BJ-askMyTurn")
    io.to(serverId).emit("allDeck", game.playerList);
  })

  //TODO : prendre l'argent deja misé deux fois quand double

  socket.on("double", (serverId, deckName) => {
    let game = findGame(serverId, BlackJackGames);
    let player = findPlayer(deckName, game.playerList)

    for(let bet of player.bets){
      if(bet.name == deckName){
        bet.amountBet *= 2
        get_user_info(deckName).then((res) => {
          changeDataBase('argent', res.argent - bet.amountBet, deckName);
          changeMoney(deckName, -bet.amountBet);
        });
      }
    }
    
    game.hit(deckName)

    if (!game.nextPlayer()) {
      player.myTurn = false;
      dealerPlay(game);
    }

    io.to(serverId).emit("allDeck", game.playerList);
    io.to(serverId).emit("BJ-askMyTurn", player.myTurn);
    
    
  })
  
  socket.on("canSplit", (serverId, playerName) => {
    let game = findGame(serverId, BlackJackGames);
    let player = findPlayer(playerName, game.playerList);
    let deck = player.deck
    let canSplit = false;
    if(deck.length == 2){
      canSplit = (deck[0].power == deck[1].power) && deck.length == 2 && !player.hasSplitted;
    }


    socket.emit("goSplitIfYouCan", canSplit);
    
  })

  //TODO : prendre l'argent deja misé deux fois quand double

  socket.on("split", (serverId, deckName) => {
    let game = findGame(serverId, BlackJackGames);
    let player = findPlayer(deckName, game.playerList)

    player.split();

    socket.emit("splitted");
    io.to(serverId).emit("allDeck", game.playerList);
  })

  socket.on("resolveMoney", (serverId) => {
    let game = findGame(serverId, BlackJackGames);

    let winnerBetList = game.findWinnerBet();

    for (let earn of winnerBetList) {

      if (earn.amountBet != null || earn.mult != null) {

        let moneyWin = earn.amountBet * earn.mult;
        io.to(serverId).emit("moneyWin", moneyWin, earn.name);  
        
        let winMessage = ""

        if(moneyWin != 0){
          winMessage = `🎉 - ${earn.name} a gagné ${moneyWin} $`
        }
        
        else {
          winMessage = `🪦 - ${earn.name} a perdu ${earn.amountBet} $`
        }

        game.addMessage(winMessage)

        get_user_info(earn.name).then((res) => {
          changeDataBase('argent', res.argent + moneyWin, earn.name);
          changeMoney(earn.name, moneyWin);
        });
      }

      game.restartRound()
      io.to(serverId).emit("getMessage", game.chatContent);
      io.to(serverId).emit("askMoney");
      io.to(serverId).emit("allDeck", game.playerList)
      io.to(serverId).emit("gameStatus", "bet");
      io.to(serverId).emit("dealerCards", game.dealerCards)
    }
  })

  socket.on("BJ-leave", (serverId, name) => {
    let game = findGame(serverId, BlackJackGames);
    let player = findPlayer(name, game.playerList);
    game.removePlayer(player)

    io.to(serverId).emit("allDeck", this.playerList);
  })

});

//DORIAN


setInterval(() => { Sentinel_Main(io, validCookies, BatailGames, TaureauGames, MilleBornesGames, lobbyList, lobbyIndex) }, 100);

