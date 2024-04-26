//DORIAN
const makecookie = (length) => {
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


const findGame = (id, availableGames) => {

  let game = 0;
  if (!availableGames) {
    return -1;
  }
  availableGames.forEach((elem) => {
    if (elem.identifiant_partie == id) { game = elem }
  });
  return game;

}

const findLobby = (id, lobbyList) => {

  let lobby = 0;
  lobbyList.forEach((elem) => {
    if (elem.id == id) { lobby = elem }
  });
  return lobby;

}

const findWaitingPlayer = (username, plist) => {

  let player = 0;
  if (!plist) {
    return -1;
  }
  plist.forEach((elem) => {
    if (elem.username == username) { player = elem }
  });
  return player;

}


const findPlayer = (username, plist) => {

  if (!plist) {
    return -1;
  }
  let player = 0;
  plist.forEach((elem) => {
    if (elem.name == username) { player = elem }
  });
  return player;

}

const generateCartes = () => {
  const symbols = ['Coeur', 'Carreau', 'Trefle', 'Pique'];
  const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'Reine', 'Roi', 'As'];
  const powers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  const deck = [];
  for (const symbol of symbols) {
    for (let i = 0; i < numbers.length; i++) {
      const card = new Bataille_Card(symbol, numbers[i], powers[i]);
      deck.push(card);
    }
  }

  return deck;
}

const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;

  while (currentIndex > 0) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const findCard = (card, deck) => {
  let count = 0;
  let found = false;
  deck.forEach((elem) => {

    if (elem.symbole == card.symbole && elem.power == card.power) {
      found = !found;
    }
    if (!found) {
      count++;
    }

  });
  return count;
}



const findRemovePlayer = (player, plist) => {
  let count = 0;
  let found = false;
  plist.forEach((elem) => {

    if (elem.name == player.name) {
      found = !found;
    }
    if (!found) {
      count++;
    }
  });
  return count;
}


//Bataille

const STATUS = {
  START: 's',
  WAITING_FOR_PLAYER_CARD: 'phase1',
  PHASE_2: 'phase2',
  DRAW: 'd',
  ENDED: "end"
};

//FLORIAN

function isBot(name) {
  let botName = ["Mathis", "Michael Jackson", "Chill Luigi", "Joe Biden", "Donald Trump"]
  return botName.includes(name);
}

class Bataille {

  constructor(idPart, maxJ, maxT, Owner, playerL, moneyBet) {
    this.identifiant_partie = idPart;
    this.maxJoueurs = maxJ;
    this.maxTurn = maxT;
    this.owner = Owner;
    this.playerList = playerL;
    this.scoreboard = {};
    this.cartes = this.generateCartes();
    this.moneyBet = moneyBet;
    this.chatContent = ["utilisez <global> pour parler a tout le monde"];
    this.cardPlayedInRound = {};
    this.cardPlayed = [];
    this.lobbyLinked = null;
    this.distribuer();
    this.hadStart = false;

    this.currentTurn = 0;
    this.status = STATUS.START;

    this.previousCardsOfDraw = [];

  }


  generateCartes() {
    const symbols = ['Coeur', 'Carreau', 'Trefle', 'Pique'];
    const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'Reine', 'Roi', 'As'];
    const powers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

    const deck = [];
    for (const symbol of symbols) {
      for (let i = 0; i < numbers.length; i++) {
        const card = new Bataille_Card(symbol, numbers[i], powers[i]);
        deck.push(card);
      }
    }

    return deck;
  }

  distribuer() {
    let cardsByPlayers = Math.floor(this.cartes.length / this.playerList.length);
    this.playerList.forEach((player, index) => {
      for (let i = 0; i < cardsByPlayers; i++) {
        let randomId = Math.floor(Math.random() * this.cartes.length)
        let randomCard = this.cartes[randomId];
        this.cartes.splice(randomId, 1);
        player.deck.push(randomCard);
      }
    })
  }

  changeScoreBoard(name) {
    if (this.scoreboard.hasOwnProperty(name)) {
      this.scoreboard[name] += 1;
    }
    else {
      this.scoreboard[name] = 1;
    }
  }

  allPlayerPlayed() {
    for (let player of this.playerList) {
      if (player.selected == null) {

        return false
      }
    }

    return true
  }

  restartRound() {
    this.cardPlayedInRound = {};
    this.previousCardsOfDraw = [];
    for (let player of this.playerList) {
      player.selected = null;
    }
  }

  playerInDraw() {
    let playersInDraw = []
    for (let i = 0; i < this.playerList.length; i++) {
      for (let j = i + 1; j < this.playerList.length; j++) {
        if (this.playerList[i].selected.power == this.playerList[j].selected.power) {
          playersInDraw.push(this.playerList[i], this.playerList[j]);
        }
      }
    }
    return playersInDraw.filter((elem, index) => playersInDraw.indexOf(elem) == index);
  }

  isADraw() {
    let maxCard = Math.max(...this.playerList.map((player) => player.selected.power));
    for (let i = 0; i < this.playerList.length; i++) {
      for (let j = i + 1; j < this.playerList.length; j++) {
        if (this.playerList[i].selected.power == this.playerList[j].selected.power) {
          if (this.playerList[i].selected.power >= maxCard) {
            return true
          }
          return false
        }
      }
    }
    return false;
  }

  findWinner(playerList) {
    if (playerList[0].selected != null) {
      let winner = playerList[0]
      for (let player of playerList) {
        if (winner.selected.power <= player.selected.power) {
          winner = player;
        }
      }
      return winner;
    }
    else {
      return 0;
    }
  }


  resolveDrawFirstPart() {
    let playersInDraw = this.playerInDraw();
    this.previousCardsOfDraw = Object.values(this.cardPlayedInRound)
    playersInDraw.forEach(player => {
      let randomId = Math.floor(Math.random() * player.deck.length);
      let card = player.deck[randomId];
      this.cardPlayedInRound[player.name] = card
      player.deck.splice(randomId, 1);
    });
  }

  findPlayerWasInDraw() {
    let playersInDrawList = []
    let playersName = Object.keys(this.cardPlayedInRound);
    console.log(this.cardPlayedInRound);
    for (let playerName of playersName) {
      this.cardPlayedInRound = {}
      let playerInDraw = findPlayer(playerName, this.playerList)
      playersInDrawList.push(playerInDraw);
    }
    return playersInDrawList;
  }

  resolveDraw(winner) {

    let cardWin = Object.values(this.cardPlayedInRound);
    winner.deck = [...winner.deck, ...cardWin, ...this.previousCardsOfDraw];

  }

  isGameEnded() {
    let nbPlayerAtZeroCard = 0;

    if (this.maxTurn <= this.currentTurn) {
      return true;
    }
    else if (this.playerList.length === 1) {
      return true
    }
    else {
      for (let player of this.playerList) {
        if (player.deck.length == 0) {
          nbPlayerAtZeroCard++
        }
      }
      return nbPlayerAtZeroCard == this.playerList.length - 1;
    }
  }

  findGameWinner() {
    if (this.isGameEnded()) {
      let winners = [this.playerList[0]]
      for (let player of this.playerList) {
        if (player.deck.length <= winners[0].deck.length) {
          if (player.deck.length == winners[0].deck.length) {
            winners.push(player)
          }
          else {
            winners = [player]
          }
        }
      }
      let winnersWithoutDoublon = winners.filter((elem, index) => winners.indexOf(elem) == index);
      return winnersWithoutDoublon.map(player => player.name);
    }
    else {
      return false
    }
  }



  removePlayer(player) {

    let playerI = findRemovePlayer(player, this.playerList);
    this.playerList.splice(playerI, 1);
    this.scoreboard[player.name] = -1;

  }

  addMessage(msg) {
    if (msg != "") {
      this.chatContent.push(msg);
    }
  }

  recreate(gameData) {
    let newPlayerList = [];

    this.currentTurn = gameData['currentTurn']


    for (let player of gameData["playerList"]) {
      let newPlayer = new Player(player["name"], player["cookie"])
      newPlayer.deck = player["deck"]
      newPlayer.selected = player["selected"]

      newPlayerList.push(newPlayer);
    }

    this.playerList = newPlayerList;
    this.scoreboard = gameData["scoreboard"];
    this.cartes = gameData["cartes"];
    this.chatContent = gameData["chatContent"];
    this.status = gameData["status"];
  }
}


class Player {

  constructor(username, cookie) {

    this.name = username;
    this.deck = [];
    this.selected = null;
    this.cookie = cookie;

    // pour le 6 qui prend 
    this.score = 0;

  }

  removeCard(card) {

    let icard = findCard(card, this.deck);
    this.deck.splice(icard, 1);

  }

  switchCard(newCard) {
    this.removeCard(newCard);
    this.deck.push(this.selected);
    this.selected = newCard;
  }

}

class Bataille_Card {

  constructor(symbole, number, power) {

    this.symbole = symbole;
    this.number = number;
    this.power = power;

  }

}

//DORIAN

//// LOBBY 

class Player_IN_Lobby {

  constructor(username, cookie) {

    this.username = username;
    this.cookie = cookie;
    this.isReady = false;
  }

}

class BotInLobby extends Player_IN_Lobby {
  constructor(username, cookie) {
    super(username, cookie);
  }
}

class Lobby {

  constructor(serverName, nbPlayerMax, isPrivate, password, gameType, ID, owner, moneyBet) {

    this.serverName = serverName;
    this.nbPlayerMax = nbPlayerMax;
    this.isPrivate = isPrivate;
    this.password = password;
    this.gameType = gameType;
    this.id = ID;
    this.playerList = [];
    this.owner = owner;
    this.tbt = 30;
    this.maxTurn = 20;
    this.moneyBet = moneyBet;
    this.gameLinked = null;
    this.hadStart = false;
  }

}

class SavedLobby extends Lobby {
  constructor(serverName, nbPlayerMax, isPrivate, password, gameType, ID, owner, moneyBet, gameData) {
    super(serverName, nbPlayerMax, isPrivate, password, gameType, ID, owner, moneyBet);

    this.gameData = gameData;
  }
}


// 6 QUI PREND 


class Carte6 {

  constructor(numero, nb_boeuf) {

    this.number = numero;
    this.nb_boeuf = nb_boeuf;

  }

}

function generate6Cartes() {

  let boeuf;
  let cartes = [];

  for (let i = 1; i < 104; i++) {

    boeuf = 1;
    if (i % 11 == 0) {

      boeuf += 4;

    }

    if (i % 10 == 0) {

      boeuf += 2

    }

    if (i % 5 == 0 && i % 10 != 0) {

      boeuf += 1

    }

    cartes.push(new Carte6(i, boeuf));

  }

  return cartes;

}



class SixQuiPrend {

  constructor(gameName, id_partie, owner, playerList, chrono, moneyBet, maxPlayer) {
    this.gameName = gameName;
    this.maxPlayer = maxPlayer;
    this.identifiant_partie = id_partie;
    this.owner = owner;
    this.playerList = playerList;
    this.selected_cards = [];

    this.mChrono = chrono;
    this.Chrono = chrono;

    this.croupier();

    this.order = [];
    this.currentP = null;

    this.winner = null;
    this.moneyBet = moneyBet;

    this.lobbyLinked = null;

    this.chatContent = ["utilisez <global> pour parler a tout le monde"];
  }

  removePlayer(player) {

    let playerI = findRemovePlayer(player, this.playerList);
    this.playerList.splice(playerI, 1);
  } j

  gagnant() {
    let al = false;

    this.playerList.forEach((elem) => {

      if (elem.score >= 20) {

        al = true;

      }

    });

    return al;

  }

  Pgagant() {

    let less = this.playerList[0];

    this.playerList.forEach((elem) => {

      if (elem.score < less.score) {

        less = elem;

      }

    });

    return less;

  }

  tousJouer() {

    let no = true;
    this.playerList.forEach((player) => {

      if (player.selected == null) {

        no = false;

      }

    });

    return no;

  }

  tousPasJouer() {

    let no = true;

    this.playerList.forEach((player) => {

      if (player.selected != null) {

        no = false;

      }

    });

    return no;

  }

  clearP() {

    this.playerList.forEach((player) => {

      player.selected = null;


    });


  }

  //TRIE EN FONCTION DE LA CARTE LA PLUS PETITE

  GiveOrder() {

    const playersCopy = [...this.playerList];

    for (let i = 1; i < playersCopy.length; i++) {
      let j = i - 1;
      const temp = playersCopy[i];
      while (j >= 0 && playersCopy[j].selected.number > temp.selected.number) {
        playersCopy[j + 1] = playersCopy[j];
        j--;
      }
      playersCopy[j + 1] = temp;
    }

    this.order = playersCopy;
    return playersCopy;

  }


  nextP() {

    if (this.order.length == 0) {
      return 0;
    }

    this.currentP = this.order.shift();

    return this.currentP;

  }


  play(row, player = null) {

    if (player == null) {
      player = this.currentP;
    }

    console.log(this.row1)
    console.log("\n")
    console.log(this.row2)
    console.log("\n")
    console.log(this.row3)
    console.log("\n")
    console.log(this.row4)
    console.log("\n")

    let card = player.selected;
    console.log("LE JOUEUR COURANT CELUI QUI EST EN TRAIN DE JOUER EST :::")
    console.log(player.name);

    console.log("{from play in D_UTILS - 681}LE JOUEUR A COMME CARTE SELECTIONNER :")
    console.log(player.selected)


    let crow;


    switch (row) {

      case 1:
        crow = this.row1;
        break;
      case 2:
        crow = this.row2;
        break;
      case 3:
        crow = this.row3;
        break;
      case 4:
        crow = this.row4;
        break;

    }


    if (this.row1[this.row1.length - 1].number > card.number && this.row2[this.row2.length - 1].number > card.number && this.row3[this.row3.length - 1].number > card.number && this.row4[this.row4.length - 1].number > card.number) {

      let sum = 0;
      crow.forEach(card => {

        sum += card.nb_boeuf;

      });

      player.score += sum;

      if (this.gagnant()) {

        this.winner = this.Pgagant();
        this.status = STATUS.ENDED;
        return true;

      }

      if (isInstanceOfBot(player)) {
        row = player.rowToDelete()
      }

      this.affectRow(row, [card]);

      return true;

    }

    if (this.findValidRow(card.number) == row) {

      crow.push(card);
      if (crow.length >= 6) {

        let sum = 0;
        crow.forEach(card => {

          sum += card.nb_boeuf;

        });

        player.score += sum;

        if (this.gagnant()) {

          this.winner = this.Pgagant();
          this.status = STATUS.ENDED;
          return true;

        }
        // VARIANTE : this.status = STATUS.WAITING_FOR_PLAYER_CARD;
        this.affectRow(row, [card]);
        // VARIANTE : this.croupier();

      }

      return true;

    }

    return false;

  }

  affectRow(row, value) {

    switch (row) {

      case 1:
        this.row1 = value;
        break;
      case 2:
        this.row2 = value;
        break;
      case 3:
        this.row3 = value;
        break;
      case 4:
        this.row4 = value;
        break;

    }

  }

  /**
   * 
   * @param {*} num valeur de la carte
   * @returns if this is a valid
   */

  findValidRow(num) {

    const r1 = this.row1[this.row1.length - 1].number - num;
    const r2 = this.row2[this.row2.length - 1].number - num;
    const r3 = this.row3[this.row3.length - 1].number - num;
    const r4 = this.row4[this.row4.length - 1].number - num;

    let minIndex;
    let minValue = 105;

    if (r1 < 0 && Math.abs(r1) < minValue) {

      minValue = Math.abs(r1);
      minIndex = 1;
    }
    if (r2 < 0 && Math.abs(r2) < minValue) {

      minValue = Math.abs(r2);
      minIndex = 2;
    }
    if (r3 < 0 && Math.abs(r3) < minValue) {

      minValue = Math.abs(r3);
      minIndex = 3;
    }
    if (r4 < 0 && Math.abs(r4) < minValue) {

      minValue = Math.abs(r4);
      minIndex = 4;
    }

    return minIndex;

  }



  croupier() {

    let cartes_a_distribuer = shuffle(generate6Cartes());

    // perdu a 66


    let k = 0;
    this.playerList.forEach((elem) => {

      elem.deck = [];

      for (let j = k; j < k + 10; j++) {
        elem.deck.push(cartes_a_distribuer[j]);
      }
      k += 10;

    });

    this.row1 = [cartes_a_distribuer[k]];
    this.row2 = [cartes_a_distribuer[k + 1]];
    this.row3 = [cartes_a_distribuer[k + 2]];
    this.row4 = [cartes_a_distribuer[k + 3]];

  }

  addMessage(msg) {
    if (msg != "") {
      this.chatContent.push(msg);
    }
  }

  recreate(gameData) {
    let newPlayerList = [];
    for (let player of gameData["playerList"]) {
      let newPlayer = new Player(player["name"], player["cookie"])
      newPlayer.out = player["out"]
      newPlayer.deck = player["deck"]
      newPlayer.selected = player["selected"]
      newPlayer.score = player["score"]
      newPlayerList.push(newPlayer);
    }
    this.selected_cards = gameData["selected_cards"]
    this.playerList = newPlayerList;
    this.chatContent = gameData["chatContent"];
    this.row1 = gameData["row1"]
    this.row2 = gameData["row2"]
    this.row3 = gameData["row3"]
    this.row4 = gameData["row4"]
    this.order = gameData["order"]
    this.currentP = gameData["currentP"]

  }

}


//FLORIAN TOUT CE QU'IL YA EN DESSOUS 

class MB_Player {
  constructor(playerName, cookie, color) {
    this.name = playerName;
    this.cookie = cookie;
    this.deck = [];
    this.color = color;
    this.state = State.DRIVING;
    this.bonus = [];
    this.nbPoints = 0;
    this.isLimited = false;
    this.myTurn = false;
  }

  giveColor(color) {
    this.color = color;
  }

  setState(state) {
    this.state = state;
  }

  addPoint(points) {
    this.nbPoints += points;
  }

  setPoint(point) {
    this.nbPoints = point;
  }
  addBonus(bonus) {
    this.bonus = [...this.bonus, bonus];
  }

  setLimited(bool) {
    this.isLimited = bool;
  }
}

const State = {
  STOP: 'stop',
  FLAT: 'flat',
  EMPTY: 'empty',
  CRASH: 'crash',
  DRIVING: 'roll',
};

const GameState = {
  EN_COURS: "EN_COURS",
  FIN: "FIN"
};

class MilleBorne {

  constructor(identifiant_partie, owner, playerList, moneyBet, maxPlayer) {
    this.identifiant_partie = identifiant_partie;
    this.owner = owner;
    this.playerList = playerList;
    this.maxPlayer = maxPlayer;
    this.order = [];
    this.cardPlayed = [];
    this.cartesAttaque = ["crash", "empty", "flat", "limit", "stop"]
    this.cardContre = ["repair", "gas", "spare", "unlimited", "roll"]
    this.cardBonus = ["tanker", "sealant", "emergency", "ace"]
    this.cardVitesse = [25, 50, 75, 100, 200]
    this.deck = this.construireJeu();
    this.state = GameState.EN_COURS;
    this.distribuer();
    this.chatContent = ["utilisez <global> pour parler a tout le monde"];
    this.moneyBet = moneyBet;
    this.lobbyLinked = null;
    this.hadStart = false;
  }

  recreate(gameData) {

    let newPlayerList = [];
    this.currentTurn = gameData['currentTurn']


    for (let player of gameData["playerList"]) {
      let newPlayer = new MB_Player(player["name"], player["cookie"], player["color"])
      newPlayer.deck = player["deck"]
      newPlayer.state = player["state"]
      newPlayer.bonus = player["bonus"]
      newPlayer.nbPoints = player["nbPoints"]
      newPlayer.isLimited = player["isLimited"]
      newPlayer.myTurn = player["myTurn"]
      newPlayerList.push(newPlayer);
    }

    this.playerList = newPlayerList;
    this.scoreboard = gameData["state"];
    this.chatContent = gameData["chatContent"];
    this.order = gameData["order"];
  }

  construireJeu() {
    let deckCards = []
    for (let i = 0; i < 3; i++) {
      deckCards.push(this.cartesAttaque[0])
      deckCards.push(this.cartesAttaque[1])
      deckCards.push(this.cartesAttaque[2])
    }

    for (let i = 0; i < 4; i++) {
      deckCards.push(this.cartesAttaque[3])
      deckCards.push(200);
    }

    for (let i = 0; i < 5; i++) {
      deckCards.push(this.cartesAttaque[4])
    }

    for (let i = 0; i < 6; i++) {
      deckCards.push(this.cardContre[0])
      deckCards.push(this.cardContre[1])
      deckCards.push(this.cardContre[2])
      deckCards.push(this.cardContre[3])
    }

    for (let i = 0; i < 14; i++) {
      deckCards.push(this.cardContre[4])
    }

    deckCards.push(this.cardBonus[0])
    deckCards.push(this.cardBonus[1])
    deckCards.push(this.cardBonus[2])
    deckCards.push(this.cardBonus[3])

    for (let i = 0; i < 10; i++) {
      deckCards.push(25)
      deckCards.push(50)
      deckCards.push(75)
    }

    for (let i = 0; i < 14; i++) {
      deckCards.push(100)
    }
    return deckCards;
  }


  distribuer() {
    this.playerList.forEach(player => {
      for (let j = 0; j < 7; j++) {
        let randomId = Math.floor(Math.random() * this.deck.length)
        let randomCard = this.deck[randomId];
        this.deck.splice(randomId, 1);
        player.deck.push(randomCard);
      }
    });
    return 0;
  }

  // shuffle(deck) {
  //   for (let k = 0; k < 5; k++) {
  //     for (let i = deck.length - 1; i > 0; i--) {
  //       const j = Math.floor(Math.random() * (i + 1));
  //       [deck[i], deck[j]] = [deck[j], deck[i]];
  //     }
  //   }
  //   return deck;
  // }


  giveOrder() {

    this.order = Array(this.playerList.length).fill(0);

    this.playerList.forEach((player) => {
      if (player.color == "blue") {
        this.order[0] = player;
      }
      else if (player.color == "red") {
        this.order[1] = player;
      }
      else if (player.color == "yellow") {
        this.order[2] = player;
      }
      else if (player.color == "black") {
        this.order[3] = player;
      }

    })
  }

  attaqued(player, card) {
    //faire en sorte que le client ne puisse pas attaqué des joueurs qui ont déja un malus sauf limitation vitesse !

    if (player.state === State.DRIVING) {
      if (card == "stop" && !player.bonus.includes("emergency")) {
        player.setState(State.STOP);
        // this.endAttaque("stop", player);
        return true
      }

      else if (card == "empty" && !player.bonus.includes("tanker")) {
        player.setState(State.EMPTY);
        // this.endAttaque("gas", player);
        return true
      }

      else if (card == "flat" && !player.bonus.includes("sealant")) {
        player.setState(State.FLAT);
        // this.endAttaque('spare', player);
        return true

      }

      else if (card == "limit" && !player.bonus.includes("emergency")) {
        player.setLimited(true);
        // this.endAttaque('unlimited', player)
        return true
      }

      else if (card == "crash" && !player.bonus.includes("ace")) {
        player.setState(State.CRASH);
        // this.endAttaque('repair', player);
        return true
      }
      else { return false; }
    }

    else { return false }

  }

  endAttaque(card, player) {
    if (card == "roll" && player.state == State.STOP || card == "emergency") {
      player.setState(State.DRIVING);
    }
    if (card == "spare" && player.state == State.FLAT || card == "sealant") {
      player.setState(State.DRIVING);
    }
    if (card == "unlimited" && player.isLimited || card == "emergency") {
      player.setLimited(false)
    }
    if (card == "gas" && player.state == State.EMPTY || card == "tanker") {
      player.setState(State.DRIVING);
    }
    if (card == "repair" && player.state == "crash" || card == "ace") {
      player.setState(State.DRIVING);
    }
  }

  vitesseCard(card, player) {
    if (player.state == State.DRIVING) {
      if (player.isLimited) {
        if (card <= 50) {
          if (player.nbPoints + card < 1000) {
            player.addPoint(card);
          }

          else {
            player.setPoint(1000 - ((player.nbPoints + card) - 1000));
          }
        }
      }
      else {
        if (player.nbPoints + card < 1000) {
          player.addPoint(card);
        }

        else {
          player.setPoint(1000 - ((player.nbPoints + card) - 1000));
        }
      }

      if (player.nbPoints === 1000) {
        this.state = GameState.FIN;
      }
    }
    else {
      return false;
    }
  }

  piocher(player) {

    if (this.deck.length > 0) {
      let randomId = Math.floor(Math.random() * this.deck.length);
      let newCard = this.deck[randomId]
      this.deck.splice(randomId, 1);
      player.deck.push(newCard);
    }
    else {
      this.deck = shuffle(this.cardPlayed);
      this.piocher(player);
    }
  }



  MB_giveOrder() {

    let list = this.playerList;

    for (let index = 0; index < list.length; index++) {
      const player = list[index];

      if (player.myTurn) {
        if (index !== list.length - 1) {
          list[index + 1].myTurn = true;
          list[index].myTurn = false;
          return true;
        }
        else {
          list[0].myTurn = true;
          list[index].myTurn = false;
          return true;
        }
      }
    }
    return false;
  }

  anyonePlayed() {
    for (let i = 0; i < this.playerList.length; i++) {
      if (this.playerList[i].myTurn) {
        return false
      }
    }
    return true;
  }

  removePlayer(player) {
    let playerI = findRemovePlayer(player, this.playerList);
    this.playerList.splice(playerI, 1);
  }

  addMessage(msg) {
    if (msg != "") {
      this.chatContent.push(msg);
    }
  }

}




class BlackJackPlayer extends Player {
  constructor(username, cookie) {
    super(username, cookie);

    this.myTurn = false;
    this.bets = [];
    this.splittedDeck = [];
    this.hasSplitted = false;
    this.onSplittedDeck = false;
    this.win = false;
  }

  newBet(amountBet, deckName) {
    let existingBetIndex = this.bets.findIndex(bet => bet[deckName]);
    if (existingBetIndex !== -1) {
      this.bets[existingBetIndex][deckName] += amountBet;
    } else {
      let newBet = {};
      newBet["name"] = deckName;
      newBet["amountBet"] = amountBet;
      newBet[deckName] = amountBet;
      this.bets.push(newBet);
    }
  }

  sumPoint() {
    let points = 0;
    let nombreAs = 0;

    for (let carte of this.deck) {
      if (carte.power >= 11 && carte.power <= 13) {
        points += 10;
      }
      else if (carte.power === 14) {
        points += 11;
        nombreAs++;
      }
      else {
        points += carte.power;
      }
    }

    while (nombreAs > 0 && points > 21) {
      points -= 10;
      nombreAs--;
    }

    return points;
  }

  sumPointSplitted() {
    let points = 0;
    let nombreAs = 0;

    for (let carte of this.splittedDeck) {
      if (carte.power >= 11 && carte.power <= 13) {
        points += 10;
      }
      else if (carte.power === 14) {
        points += 11;
        nombreAs++;
      }
      else {
        points += carte.power;
      }
    }

    while (nombreAs > 0 && points > 21) {
      points -= 10;
      nombreAs--;
    }

    return points;
  }

  split() {
    let cardSplitted = this.deck[1]
    this.deck.splice(1, 1);
    this.splittedDeck.push(cardSplitted);
    this.hasSplitted = true;
    this.onSplittedDeck = false;
  }
}


/////////////////////////////////////////////////////////////////////////
///////////////////////////BLACKJACK////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


function sumPoint(deck) {
  let points = 0;
  let nombreAs = 0;
  for (let carte of deck) {

    if (carte.power >= 11 && carte.power <= 13) {
      points += 10;
    }
    else if (carte.power === 14) {
      points += 11;
      nombreAs++;
    }
    else {
      points += carte.power;
    }
  }

  while (nombreAs > 0 && points > 21) {
    points -= 10;
    nombreAs--;
  }

  return points;
}

class BlackJack {

  constructor(idPart, maxJ, Owner, playerL) {
    this.identifiant_partie = idPart;
    this.maxJoueurs = maxJ;
    this.owner = Owner;
    this.playerList = playerL;
    this.cartes = generateCartes();
    this.dealerCards = []
    this.chatContent = ["utilisez <global> pour parler a tout le monde"];
    shuffle(this.cartes);
    this.distribuer();
    this.generateDealerCards();
    this.hadStart = false;

  }



  distribuer() {
    this.playerList.forEach((player, _) => {
      for (let i = 0; i < 2; i++) {
        let card = this.cartes[i];
        this.cartes.splice(i, 1);
        player.deck.push(card);
      }
    })
  }

  generateDealerCards() {

    let card = this.cartes[0];
    this.cartes.splice(0, 1);
    this.dealerCards.push(card);

  }


  nextPlayer() {

    let list = this.playerList;

    for (let index = 0; index < list.length; index++) {
      const player = list[index];

      if (player.myTurn) {
        if (index !== list.length - 1) {
          list[index + 1].myTurn = true;
          list[index].myTurn = false;
          return true;
        }
        else {
          list[list.length - 1].myTurn = false
          return false;
        }
      }
    }
    return false;
  }

  anyonePlayed() {
    for (let i = 0; i < this.playerList.length; i++) {
      if (this.playerList[i].myTurn) {
        return false
      }
    }
    return true;
  }


  hit(playerName) {

    let player = findPlayer(playerName, this.playerList);
    let newCard = this.cartes[0]
    this.cartes.splice(0, 1);
    if (!player.onSplittedDeck) {
      player.deck.push(newCard);
    }
    else {
      player.splittedDeck.push(newCard);
    }

  }



  dealerHit() {
    let newCard = this.cartes[0]
    this.cartes.splice(0, 1);
    this.dealerCards.push(newCard);
  }


  sumPoint() {
    let points = 0;
    let nombreAs = 0;
    for (let carte of this.dealerCards) {

      if (carte.power >= 11 && carte.power <= 13) {
        points += 10;
      }
      else if (carte.power === 14) {
        points += 11;
        nombreAs++;
      }
      else {
        points += carte.power;
      }
    }

    while (nombreAs > 0 && points > 21) {
      points -= 10;
      nombreAs--;
    }

    return points;
  }



  findStatus() {
    for (let player of this.playerList) {
      if (player.bets.length === 0) {
        return "bet";
      }
    }
    return "action"
  }


  restartRound() {
    for (let player of this.playerList) {
      player.deck = [];
      player.bets = [];
      player.myTurn = false;
      player.splittedDeck = [];
      player.hasSplitted = false;
      player.onSplittedDeck = false;
    }

    this.dealerCards = [];
    this.cartes = shuffle(generateCartes());
    this.playerList[0].myTurn = true;
    this.distribuer();
    this.generateDealerCards();
  }




  calculMultiplicateur(deck) {
    let totalPoint = sumPoint(deck);
    let totalCroupier = this.sumPoint()

    if (deck.length == 2 && totalPoint == 21) {
      return 2.5;

      //blackJack
    }

    else if (totalPoint > 21) {
      return 0;
    }

    else if (totalCroupier > 21) {
      return 2
    }

    else if (totalCroupier == 21 && this.dealerCards.length == 2) {
      return 0
    }

    else if (totalCroupier == totalPoint) {
      return 1;
    }

    else if (totalCroupier < totalPoint) {
      return 2;
    }

    else {
      return 0;
    }

  }

  findWinnerBet() {
    let winnerList = this.playerList
    let betsWin = []
    for (let player of this.playerList) {
      for (let bet of player.bets) {
        let better = findPlayer(bet.name, this.playerList);
        if (winnerList.includes(better)) {
          let multiplicateur = this.calculMultiplicateur(player.deck)
          bet["mult"] = multiplicateur
          betsWin.push(bet);
        }
      }
    }
    return betsWin;
  }

  // removePlayer(player) {

  //   let playerI = findRemovePlayer(player, this.playerList);
  //   this.playerList.splice(playerI, 1);
  // }

  addMessage(msg) {
    if (msg != "") {
      this.chatContent.push(msg);
    }
  }

  removePlayer(playerName) {
    for (let i = 0; i < this.playerList.length; i++) {
      if (this.playerList[i].name == playerName) {
        this.playerList.splice(i, 1);
        return 1;
      }
    }
    return 0;
  }


}

class Bot extends Player {
  constructor(username, cookie) {
    super(username, cookie);
  }

  playCard() {
    throw new Error("playCard method must be implemented");
  }

  playRow() {
    throw new Error("playRow method must be implemented");
  }

  getVoiceLine() {
    let randomLine = Math.floor(Math.random() * this.voiceLine.length);
    return this.voiceLine[randomLine];
  }
}



class MathisBot extends Bot {
  constructor(username, cookie) {
    super(username, cookie)
    this.voiceLine = [

      "ouga bouga",
      "Mmmmh je sais quel est le meilleur coup !",
      "J'adore les bananes !",
      "DonkeyKong est mon frere",
      "C'est un mauvais coup ! OUGA",
      "Je viens de la jungle"

    ]
  }

  getMax() {
    let max = this.deck[0]
    for (let card of this.deck) {
      if (card.number > max.number) {
        max = card;
      }
    }
    return max;
  }


  getMin() {
    let min = this.deck[0]
    for (let card of this.deck) {
      if (card.number < min.number) {
        min = card;
      }
    }
    return min;
  }


  playCard(game) {
    const max = this.deck[0];
    const min = this.deck[0];
    let topOrBot = false;
    if (Math.floor(Math.random() * 2) == 0) {
      topOrBot = true;
    }
    if (topOrBot) {
      this.deck.splice(0, 1);
      return max
    }
    this.deck.splice(0, 1);
    return min

  }

  rowToDelete() {
    return 1;
  }

}

class ObamnaBot extends Bot {
  constructor(username, cookie) {
    super(username, cookie)
    this.voiceLine = [
      "Ma plus grande faiblesse ? je suis Obama !",
      "Its Obama TIME ",
      "💭 💤 Oil Oil Oil Oil... 💤 💭",
      "I have a drEeaaAAam",
      "Je vais t'applatir comme j'ai applatit le Moyen-Orient"
    ]
    this.TOLERANCE = 5
  }


  playCard(game) {
    let tableValue1 = game.row1[game.row1.length - 1].number;
    let tableValue2 = game.row2[game.row2.length - 1].number;
    let tableValue3 = game.row3[game.row3.length - 1].number;
    let tableValue4 = game.row4[game.row4.length - 1].number;

    for (let card of this.deck) {
      let val = card.number;
      if (val > tableValue1 && val - tableValue1 <= this.TOLERANCE) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
      if (val > tableValue2 && val - tableValue2 <= this.TOLERANCE) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
      if (val > tableValue3 && val - tableValue3 <= this.TOLERANCE) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
      if (val > tableValue4 && val - tableValue4 <= this.TOLERANCE) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }

    }


    for (let card of this.deck) {
      if (card.value > tableValue1 || card.value > tableValue2 || card.value > tableValue3 || card.value > tableValue4) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
    }

    //renvoyer la premiere carte du deck si aucune bonne carte trouvé.

    this.deck.splice(0, 1);
    return this.deck[0];
  }


  rowToDelete() {
    let tableList = [game.row1, game.row2, game.row3, game.row4]
    let maxIndex = 1
    let min_tot = 100;
    let tot = 0
    let i = 1;
    for (let table of tableList) {
      for (let card of table) {
        tot += card.number
      }
      if (min_tot > tot) {
        min_tot = tot
        maxIndex = i
      }
      i++
    }
    return maxIndex;
  }

}

class DonaldTrumpBot extends Bot {
  constructor(username, cookie) {
    super(username, cookie)
    this.voiceLine = [
      "WTF IS A KILOMETER !!!!!",
      "I hate sleepy Joe",
      "J'ai pas d'A.D.N j'ai USA",
      "🦅 🦅 🦅 🦅 🦅 🦅",
      "Attention ou je construis un mur entre toi et moi"
    ];
    this.TOLERANCE = 10;
  }


  playCard(game) {
    let tableValue1 = game.row1[game.row1.length - 1].number;
    let tableValue2 = game.row2[game.row2.length - 1].number;
    let tableValue3 = game.row3[game.row3.length - 1].number;
    let tableValue4 = game.row4[game.row4.length - 1].number;
    let high_to_low_cow = []

    while (high_to_low_cow.length != this.deck.length) {
      let handCopy = this.deck;
      let highest = handCopy[0]
      for (let card of handCopy) {
        if (highest.nb_boeuf >= card.nb_boeuf && !high_to_low_cow.includes(card)) {
          highest = card;
        }
      }
      high_to_low_cow.unshift(highest);
    }

    for (let card in high_to_low_cow) {
      let val = card.number;
      if (val > tableValue1 && val - tableValue1 <= this.TOLERANCE - 6 && game.row1.length == 4) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
      if (val > tableValue2 && val - tableValue2 <= this.TOLERANCE && game.row2.length == 4) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
      if (val > tableValue3 && val - tableValue3 <= this.TOLERANCE && game.row3.length == 4) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
      if (val > tableValue4 && val - tableValue4 <= this.TOLERANCE && game.row4.length == 4) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
    }

    for (let card of high_to_low_cow) {
      let val = card.number;
      if (val > tableValue1 && val - tableValue1 <= this.TOLERANCE) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
      if (val > tableValue2 && val - tableValue2 <= this.TOLERANCE) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
      if (val > tableValue3 && val - tableValue3 <= this.TOLERANCE) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
      if (val > tableValue4 && val - tableValue4 <= this.TOLERANCE) {
        let cardIndex = this.deck.indexOf(card);
        this.deck.splice(cardIndex, 1)
        return card;
      }
    }

    let cardIndex = this.deck.indexOf(high_to_low_cow[0]);
    this.deck.splice(cardIndex, 1);
    return high_to_low_cow[0];
  }


  rowToDelete() {
    let tableList = [game.row1, game.row2, game.row3, game.row4]
    let maxIndex = 1
    let min_tot = 100;
    let tot = 0
    let i = 1;
    for (let table of tableList) {
      for (let card of table) {
        tot += card.number
      }
      if (min_tot > tot) {
        min_tot = tot
        maxIndex = i
      }
      i++
    }
    return maxIndex;
  }

}


class ChillLuigiBot extends Bot {
  constructor(username, cookie) {
    super(username, cookie)
    this.voiceLine = [

      "mAAarRRrIiOoO, faut tester les champignons Mariooooooo 🍃 🍃",
      "Princesssssss Peachhhhh I <3 Uuuuuuuuuuu",
      "BOMBOCLAT",
      "DonkeyKong a mangé ma BANANE 🤬🤬🤬",
      "IT'S ME LUIIIiiiiiiiiiiiiii..... 🍃"
    ]
  }
  playCard() {
    let randomCardIndex = Math.floor(Math.random() * this.deck.length - 1);
    let cardSelected = this.deck[randomCardIndex];
    this.deck.splice(0, randomCardIndex);
    return cardSelected;
  }

  playRow() {
    let randomRow = Math.floor(Math.random() * 4);
    return randomRow + 1; // +1 car ca part pas de 0 
  }

}



class JoeBidenBot extends Bot {
  constructor(username, cookie) {
    super(username, cookie)
    this.voiceLine = [
      "L'amerique peut etre résumé en un seul mot : Suakjkejfziahb",
      "Ma glace préféré est chocolat et pépite de Menth",
      "T'as quel age 17 ans ?? [...] QUOI 6 ANS !!!",
      "Tu sais ca parle de tu sais, a propos de tu sais"

    ]
  }
  playCard(game) {

    let instanceOfGame = JSON.stringify(game);
    let instanceOfDeck = []
    for(let card of this.deck){
      instanceOfDeck.push(card);
    }

    function testOutcome(card, game) {
      let outCome = 0;
      let OPFOR_outcome = 0;

      let sample = []
      sample.push(card);

      let cardsPlayed = []
      let gameDeck = generate6Cartes();

      for(let player of game.playerList){
        cardsPlayed = [...cardsPlayed, ...player.deck];
      }

      let cards = gameDeck.filter(card => !cardsPlayed.includes(card));

      shuffle(cards);
      for(let i = 0; i<game.playerList.length - 2; i++){
        sample.push(cards.pops());
      }

      let row1 = game.row1;
      let row2 = game.row2;
      let row3 = game.row3;
      let row4 = game.row4;

      let rows = [row1,row2,row3,row4];
      
      for(let obj of sample){
        if(row1[row1.length - 1].number > obj.number && row2[row2.length - 1].number > obj.number && row3[row3.length - 1].number > obj.number && row4[row4.length - 1].number > obj.number){
          let tableList = [game.row1, game.row2, game.row3, game.row4]
          let max_idx = 1
          let min_tot = 100;
          let tot = 0
          let i = 1;
          for (let table of tableList) {
            for (let card of table) {
              tot += card.number
            }
            if (min_tot > tot) {
              min_tot = tot
              max_idx = i
            }
            i++
          }

          if(obj == card){
            outCome = outCome - rows[max_idx].reduce((total, card) => total + card.nb_boeuf, 0);
          }
          else {
            OPFOR_outcome = outCome - rows[max_idx].reduce((total, card) => total + card.nb_boeuf, 0);
          }

          if(i==1){
            row1 = [obj]
          }
          else if(i == 2){
            row2 = [obj]
          }
          else if (i == 3){
            row3 = [obj];
          }
          else {
            row4 = [obj]
          }
        }
        else {
          let sumrow1 = obj.number - row1[row1.length-1].number;
          let sumrow2 = obj.number - row2[row2.length-1].number;
          let sumrow3 = obj.number - row3[row3.length-1].number;
          let sumrow4 = obj.number - row4[row4.length-1].number;

          let minima = Math.min(...[sumrow1, sumrow2, sumrow3, sumrow4].filter(item => item >= 0));

          if(sumrow1 == minima){
            row1.push(obj)
          }
          if(sumrow2 == minima){
            row2.push(obj)
          }
          if(sumrow3 == minima){
            row3.push(obj)
          }
          if(sumrow4 == minima){
            row4.push(obj)
          }

          let sumn = 0;

          if(row1.length == 6){
            sumn = row1.reduce((total, card) => total + card.nb_boeuf, 0);
          }

          
          if(row2.length == 6){
            sumn = row2.reduce((total, card) => total + card.nb_boeuf, 0);
          }

          if(row3.length == 6){
            sumn = row3.reduce((total, card) => total + card.nb_boeuf, 0);
          }

          if(row4.length == 6){
            sumn = row4.reduce((total, card) => total + card.nb_boeuf, 0);
          }

          if(sumn > 0){
            if(obj == card){
              outCome = outCome + sumn;
            }
            else {
              OPFOR_outcome = OPFOR_outcome + sumn;
            }
          }
        }
      }
      return [outCome, OPFOR_outcome]
    }

    let best_outcome = 10000
    let best_opfor = -1
    let card = 0;

    instanceOfGame = JSON.parse(instanceOfGame);

    for(let cardIt of instanceOfDeck){
      let testoutcomeCall = testOutcome(cardIt,game)
      let outcome = testoutcomeCall[0]
      let Oppfor_Outcome= testoutcomeCall[1]

      if(outcome < best_outcome){
        best_outcome = outcome;
        best_opfor = Oppfor_Outcome
        card = cardIt;
      }
      else if(outcome == best_outcome){
        if(best_opfor > Oppfor_Outcome){
          best_outcome = outcome;
          best_opfor = Oppfor_Outcome;
          card = cardIt;
        }
      }
    }



    game.row1 = instanceOfGame.row1
    game.row2 = instanceOfGame.row2
    game.row3 = instanceOfGame.row3
    game.row4 = instanceOfGame.row4

    
    let cardIndex = this.deck.indexOf(card);
    instanceOfDeck.splice(cardIndex,1);
    this.deck = instanceOfDeck;
    return card;

  }

  rowToDelete() {
    let tableList = [game.row1, game.row2, game.row3, game.row4]
    let maxIndex = 1
    let min_tot = 100;
    let tot = 0
    let i = 1;
    for (let table of tableList) {
      for (let card of table) {
        tot += card.number
      }
      if (min_tot > tot) {
        min_tot = tot
        maxIndex = i
      }
      i++
    }
    return maxIndex;
  }

}



function getOpponent(plist, current_player) {
  let opponentList = [];
  plist.forEach((player, _) => {
    if (player.name !== current_player.name) {
      opponentList.push(player);
    }
  })
  return opponentList;
}

function isInstanceOfBot(bot) {
  return bot instanceof MathisBot || bot instanceof ObamnaBot || bot instanceof DonaldTrumpBot || bot instanceof ChillLuigiBot || bot instanceof JoeBidenBot
}


module.exports = {
  makecookie,
  Lobby,
  Player_IN_Lobby,
  Player,
  Bataille,
  STATUS,
  findPlayer,
  findGame,
  findLobby,
  findWaitingPlayer,
  SixQuiPrend,
  MilleBorne,
  MB_Player,
  getOpponent,
  GameState,
  BlackJack,
  BlackJackPlayer,
  MathisBot,
  ObamnaBot,
  DonaldTrumpBot,
  ChillLuigiBot,
  JoeBidenBot,
  isInstanceOfBot,
  BotInLobby
}