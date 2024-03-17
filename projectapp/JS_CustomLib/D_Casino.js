//lass RoulettePlayer{
//
// constructor(name, cookie, pos){
//
//   this.name = name;
//   this.cookie = cookie;
//   this.pos = pos;
//   this.bets = [];
//
// }
//}

class Roulette{

  constructor(){
    
    this.timer = 30;
    this.roll = -1;
    this.lastRolls = [];
    this.bets = [];
    this.wins = [];
    this.chatContent = ["use <global> to talk to everyone"];

  }

  addMessage(msg){
    if (msg != "") {
      this.chatContent.push(msg);
    }
  } 

  rolls(){

    this.lastRolls.push(this.roll);
    this.roll = Math.floor(Math.random() *  37);

  }

  resolveBets(){

    this.bets.forEach((bet) => {


      let player = bet['nom'];
      let ammount = bet['betAmmount'];
      let pos = bet['betPos'];
      let MonneyWon = 0;

      if (this.roll == 0 || pos == 0) {
        if (pos == 0 && this.roll == 0) {
            MonneyWon += ammount * 36;
        }
    } else {
        // Numéros simples
        if (pos <= 36 && pos == this.roll) {
            MonneyWon += ammount * 36;
        }
    
        // Paris sur les groupes de numéros
        if (pos >= 37 && pos <= 39) {
            if ((pos == 37 && this.roll < 13) ||
                (pos == 38 && this.roll > 12 && this.roll < 25) ||
                (pos == 39 && this.roll > 24)) {
                MonneyWon += ammount * 3;
            }
        }
    
        // Pari sur la parité
        if ((this.roll % 2 == 0 && pos == 40) ||
            (this.roll % 2 != 0 && pos == 41)) {
            MonneyWon += ammount * 2;
        }
    
        // Pari sur la couleur
        if ((this.roll <= 10 && this.roll % 2 != 0 || this.roll >= 11 && this.roll % 2 == 0) && pos == 43) {
            MonneyWon += ammount * 2;
        }
        if ((this.roll <= 10 && this.roll % 2 == 0 || this.roll >= 11 && this.roll % 2 != 0) && pos == 42) {
            MonneyWon += ammount * 2;
        }
    
        // Pari sur la plage de numéros
        if ((pos == 44 && this.roll >= 1 && this.roll <= 18) ||
            (pos == 45 && this.roll >= 19 && this.roll <= 36)) {
            MonneyWon += ammount * 2;
        }
    }

      this.wins.push({name:player,won:MonneyWon,position:pos});


    });

  }

}


module.exports = {

  Roulette

}