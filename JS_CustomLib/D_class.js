export const STATUS = {
    START: 's',
    WAITING_FOR_PLAYER_CARD: 'w',
    DRAW: 'd'
};
  
export class Game{
    
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
        
        console.log(currentW);
  
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
      console.log(this.scoreboard);
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
  
              console.log(this.scoreboard);
    }
  
  
    removePlayer(player){
  
      let playerI = findRemovePlayer(player,this.playerList);
      this.playerList.splice(playerI,1);
      this.scoreboard[player.name] = -1;
  
    }
  
}
  
  
export class Players{
  
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
  
  class Card{
  
    constructor(symbole, number, power){
  
      this.symbole = symbole;
      this.number = number;
      this.power = power;
  
    }
  
}

export class WaitingPlayer {

    constructor(username,cookie){
  
      this.username = username;
      this.cookie = cookie;
      this.isReady = false;
    }
  
}
  
export class Lobby{
  
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
  