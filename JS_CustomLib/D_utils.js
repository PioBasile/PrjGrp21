export function makecookie(length) {
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
  
  
export function findGame(id){
  
      let game = 0;
      availableGames.forEach((elem) => {
        if(elem.identifiant_partie == id){game=elem}
      });
      return game;
  
}
  
export function findLobby(id){
  
    let lobby = 0;
    lobbyList.forEach((elem) => {
      if(elem.id == id){lobby=elem}
    });
    return lobby;
  
}
  
export function findWaitingPlayer(username, plist){
  
    let player = 0;
    plist.forEach((elem) => {
      if(elem.username == username){player=elem}
    });
    return player;
  
}
  
  
export function findPlayer(username, plist){
  
    let player = 0;
    plist.forEach((elem) => {
      if(elem.name == username){player=elem}
    });
    return player;
  
}
  
export function generateCartes() {
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
  
export function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex > 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}
  
export function findCard(card, deck){
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
  
export function findRemovePlayer(player, plist){
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