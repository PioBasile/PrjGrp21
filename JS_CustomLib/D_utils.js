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
  
  
const findGame = (id,availableGames) => {
  
      let game = 0;
      availableGames.forEach((elem) => {
        if(elem.identifiant_partie == id){game=elem}
      });
      return game;
  
}
  
const findLobby = (id,lobbyList) => {
  
    let lobby = 0;
    lobbyList.forEach((elem) => {
      if(elem.id == id){lobby=elem}
    });
    return lobby;
  
}
  
const findWaitingPlayer = (username, plist) => {
  
    let player = 0;
    plist.forEach((elem) => {
      if(elem.username == username){player=elem}
    });
    return player;
  
}
  
  
const findPlayer = (username, plist) => {
  
    let player = 0;
    plist.forEach((elem) => {
      if(elem.name == username){player=elem}
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
    let currentIndex = array.length,  randomIndex;
  
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
  
        if(elem.symbole == card.symbole && elem.power == card.power){
          found = !found;
        }
        if(!found){
          count++;
        }
  
      });
    return count;
}
  
const findRemovePlayer = (player, plist) => {
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


//Bataille

const STATUS = {
  START: 's',
  WAITING_FOR_PLAYER_CARD: 'w',
  DRAW: 'd'
};

class Bataille{
  
  constructor(idPart,maxJ,maxT,Owner,playerL){

    this.identifiant_partie = idPart;
    this.maxJoueurs = maxJ;
    this.maxTurn = maxT;
    this.owner = Owner;
    this.playerList = playerL;
    this.scoreboard = {};
    this.cartes = shuffle(generateCartes());

    let index = 0;

    this.playerList.forEach((player) => {

      this.scoreboard[player.name] = 0;
      

      for(let i = 0;i<Math.floor(52/(this.maxJoueurs));i++){
          if(i==20){break}
          player.deck.push(this.cartes[index]);
          index++;
      }
  

    });
  

    this.currentTurn = 0;
    this.status = STATUS.START;

    this.Rwinner;
    this.Rdraw;

  }

  resolve(){

    let maxP = 0;
    let currentW = null;
    let drawP = [];

    this.playerList.forEach((player)=>{

      if(player.out){
        return;
      }
      
      let power = player.selected.power
      player.removeCard(player.selected);
      player.selected = null;

      if(power == maxP){

          drawP.push(player, currentW);
          currentW = null;
  
        }

      if(power > maxP){

        maxP = power;
        currentW = player;
        drawP = [];

      }
      
      

    });

    if(currentW != null){

      this.Rwinner = currentW;
      this.Rdraw = null;
      this.scoreboard[currentW.name]+=1;
      get_user_info(currentW.name).then((res) => {

        changeDataBase('roundWin',res.roundWin + 1,currentW.name);
    
      });

    } else {

      this.Rwinner = null;
      this.Rdraw = drawP;

    }
    
    return 0;

  }

  resolve_draw(){

      let maxP = 0;
      let currentW = null;
      let drawP = [];

      this.Rdraw.forEach((player)=>{

        if(player.out){
          return;
        }
          
          let power = player.selected.power
          player.removeCard(player.selected);
          player.selected = null;


          if(power == maxP){

              drawP.push(player, currentW);
              currentW = null;
  
          }

          if(power > maxP){

              maxP = power;
              currentW = player;
              drawP = [];

          }
    });
    
            if(currentW != null){

                this.Rwinner = currentW;
                this.Rdraw = null;
                this.scoreboard[currentW.name]+=1;
                get_user_info(currentW.name).then((res) => {

                  changeDataBase('roundWin',res.roundWin + 1,currentW.name);
              
                });
        
              } else {
        
                this.Rwinner = null;
                this.Rdraw = drawP;
        
              }

        
  }


  removePlayer(player){

    let playerI = findRemovePlayer(player,this.playerList);
    this.playerList.splice(playerI,1);
    this.scoreboard[player.name] = -1;

  }




}


 class Player{

  constructor(username,cookie){

    this.out = false;
    this.name = username;
    this.deck = [];
    this.selected = null;
    this.cookie = cookie;

  }

  removeCard(card){

    let icard = findCard(card,this.deck);
    this.deck.splice(icard,1);

  }

}

 class Bataille_Card{

  constructor(symbole, number, power){

    this.symbole = symbole;
    this.number = number;
    this.power = power;

  }

}



//// LOBBY 

 class Player_IN_Lobby {

  constructor(username,cookie){

    this.username = username;
    this.cookie = cookie;
    this.isReady = false;
  }

}

class Lobby{

  constructor(serverName, nbPlayerMax, isPrivate, password, gameType, ID, owner){

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

  }

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
  findWaitingPlayer

}