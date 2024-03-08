const { REPL_MODE_STRICT } = require("repl");
const { login, changeDataBase, get_user_info, register } = require("./D_db.js");

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
  if(!availableGames){
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
  plist.forEach((elem) => {
    if (elem.username == username) { player = elem }
  });
  return player;

}


const findPlayer = (username, plist) => {

  if(!plist){
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

class Bataille {

  constructor(idPart, maxJ, maxT, Owner, playerL, moneyBet) {

    this.identifiant_partie = idPart;
    this.maxJoueurs = maxJ;
    this.maxTurn = maxT;
    this.owner = Owner;
    this.playerList = playerL;
    this.scoreboard = {};
    this.cartes = shuffle(generateCartes());
    this.moneyBet = moneyBet;
    this.chatContent = [];
    this.cardPlayedInRound = [];

    let index = 0;

    this.playerList.forEach((player) => {

      this.scoreboard[player.name] = 0;


      for (let i = 0; i < Math.floor(52 / (this.maxJoueurs)); i++) {
        if (i == 20) { break }
        player.deck.push(this.cartes[index]);
        index++;
      }


    });


    this.currentTurn = 0;
    this.status = STATUS.START;

    this.Rwinner;
    this.Rdraw;

  }

  resolve() {

    let maxP = 0;
    let currentW = null;
    let drawP = [];

    this.playerList.forEach((player) => {

      if (player.out) {
        return;
      }

      let power = player.selected.power
      player.removeCard(player.selected);
      player.selected = null;

      if (power == maxP) {

        drawP.push(player, currentW);
        currentW = null;

      }

      if (power > maxP) {

        maxP = power;
        currentW = player;
        drawP = [];

      }



    });

    if (currentW != null) {

      this.Rwinner = currentW;
      this.Rdraw = null;
      this.scoreboard[currentW.name] += 1;
      get_user_info(currentW.name).then((res) => {

        changeDataBase('roundWin', res.roundWin + 1, currentW.name);

      });

    } else {

      this.Rwinner = null;
      this.Rdraw = drawP;

    }

    return 0;

  }

  resolve_draw() {

    let maxP = 0;
    let currentW = null;
    let drawP = [];

    this.Rdraw.forEach((player) => {

      if (player.out) {
        return;
      }

      let power = player.selected.power
      player.removeCard(player.selected);
      player.selected = null;


      if (power == maxP) {

        drawP.push(player, currentW);
        currentW = null;

      }

      if (power > maxP) {

        maxP = power;
        currentW = player;
        drawP = [];

      }
    });

    if (currentW != null) {

      this.Rwinner = currentW;
      this.Rdraw = null;
      this.scoreboard[currentW.name] += 1;
      get_user_info(currentW.name).then((res) => {

        changeDataBase('roundWin', res.roundWin + 1, currentW.name);

      });

    } else {

      this.Rwinner = null;
      this.Rdraw = drawP;

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
}


class Player {

  constructor(username, cookie) {

    this.out = false;
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

}

class Bataille_Card {

  constructor(symbole, number, power) {

    this.symbole = symbole;
    this.number = number;
    this.power = power;

  }

}



//// LOBBY 

class Player_IN_Lobby {

  constructor(username, cookie) {

    this.username = username;
    this.cookie = cookie;
    this.isReady = false;
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

  constructor(id_partie, owner, player_list, chrono, moneyBet) {

    this.identifiant_partie = id_partie;
    this.owner = owner;
    this.player_list = player_list;
    this.selected_cards = [];

    this.mChrono = chrono;
    this.Chrono = chrono;

    this.croupier();

    this.order = [];
    this.currentP = null;

    this.winner = null;
    this.moneyBet = moneyBet;
  }

  gagnant() {
    let al = false;

    this.player_list.forEach((elem) => {

      if (elem.score >= 20) {

        al = true;

      }

    });

    return al;

  }

  Pgagant() {

    let less = this.player_list[0];

    this.player_list.forEach((elem) => {

      if (elem.score < less.score) {

        less = elem;

      }

    });

    return less;

  }

  tousJouer() {

    let no = true;
    this.player_list.forEach((player) => {

      if (player.selected == null) {

        no = false;

      }

    });

    return no;

  }

  tousPasJouer() {

    let no = true;

    this.player_list.forEach((player) => {

      if (player.selected != null) {

        no = false;

      }

    });

    return no;

  }

  clearP() {

    this.player_list.forEach((player) => {

      player.selected = null;


    });


  }


  GiveOrder() {

    const playersCopy = [...this.player_list];

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

  play(row) {


    let player = this.currentP;
    let card = player.selected;

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
    this.player_list.forEach((elem) => {

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

}

class Player6 {

  constructor(name) {

    this.name = name;
    this.deck = [];
    this.played = false;
    this.score = 0;

  }

}


//JEU MILLE BORNE BY xX_PROGRAMMER69_Xx

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

  constructor(identifiant_partie, owner, playerList, moneyBet) {
    this.identifiant_partie = identifiant_partie;
    this.owner = owner;
    this.playerList = playerList;
    this.order = [];
    this.cardPlayed = [];
    this.cartesAttaque = ["crash", "empty", "flat", "limit", "stop"]
    this.cardContre = ["repair", "gas", "spare", "unlimited", "roll"]
    this.cardBonus = ["tanker", "sealant", "emergency", "ace"]
    this.cardVitesse = [25, 50, 75, 100, 200]
    this.deck = this.construireJeu();
    this.state = GameState.EN_COURS;
    this.distribuer();
    this.chatContent = [];
    this.moneyBet = moneyBet;
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
    console.log("nym");
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

      else if (card == "limite" && !player.bonus.includes("emergency")) {
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

    else {return false}

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
          if (player.points + card < 1000) {
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

  playCard(card, player) {
    if (this.playerList.includes(player)) {

      let playerDeck = player.deck
      playerDeck.splice(playerDeck.indexOf(card), 1)

      if (!this.cardBonus.includes(card)) { this.cardPlayed.push(card); };

      if (this.cardVitesse.includes(card)) { this.vitesseCard(card, player); }

      else if (this.cardBonus.includes(card)) {
        player.addBonus(card);
      }

      else if (this.cardContre.includes(card)) { this.endAttaque(card, player); }

      else {
        throw new Error("card doesn't exist");
      }
    }

    else {
      throw new Error("player missmatch with playerList");
    }
  }


  MB_giveOrder() {

    let list = this.playerList;

    for (let index = 0; index < list.length; index++) {
      const player = list[index];

      if (player.myTurn) {
        if (index !== list.length - 1) {
          console.log(index);
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

    // list[0].myTurn = true;
    return false;
  }

  anyonePlayed(){
    for(let i = 0; i < this.playerList.length; i++){
      if(this.playerList[i].myTurn){
        return false
      }
    }
    return true;
  }

  removePlayer(player){
    let playerI = findRemovePlayer(player, this.playerList);
    this.playerList.splice(playerI,1);
  }

  addMessage(msg){
    if(msg != ""){
      this.chatContent.push(msg);
    }
    console.log(this.chatContent);
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


module.exports = {
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
}