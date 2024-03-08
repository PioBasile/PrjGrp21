// FICHIER CREE LE JOUR DE LA MORT DE TORIYAMA RIP

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
  
  } = require("./D_utils.js");

  const { Roulette } = require("./D_Casino.js");



const Sentinel_Main = (validCookies,BatailGames,TaureauGames,MilleBornesGames,lobbyList,lobbyIndex) => {

    LobbyGuard(lobbyList,validCookies);

}


function LobbyGuard(lobbyList,validCookies){


    lobbyList.forEach(lobby => {

        if(!lobby.is_empty){
        
            lobby_Player_List = lobby.playerList;

            if(lobby.playerList[0] == [][0]){
                console.log("sniped")
                lobbyList.splice(lobbyList.indexOf(lobby));
            } else {
                lobby_Player_List.forEach((player) => {
                                        
                    if(validCookies[player.username] != player.cookie){
                        
                        lobby.playerList.splice(lobby.playerList.indexOf(player));  
        
                    }
        
                });
            }

        }  
    });

}

module.exports = {

    Sentinel_Main,
}