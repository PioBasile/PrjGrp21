const { Player, Bataille_Card } = require("./D_Utils");


class PresidentPlayer {
    constructor(username, cookie) {

        this.name = username;
        this.deck = [];
        this.cookie = cookie;
        this.myTurn = false;

    }

}

class President {

    constructor(idPart, maxJ, maxT, Owner, playerL, moneyBet) {
        this.identifiant_partie = idPart;
        this.maxJoueurs = maxJ;
        this.maxTurn = maxT;
        this.owner = Owner;
        this.playerList = playerL;
        this.cartes = this.generateCartes();
        this.moneyBet = moneyBet;
        this.chatContent = ["utilisez <global> pour parler a tout le monde"];
        this.cardPlayed = []; // card played in a round sois avant un carré ou un deux
        this.lobbyLinked = null;
        this.distribuer();
        this.currentTurn = 0;
        this.playForced = false;

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
        this.playerList.forEach((player, _) => {
            for (let i = 0; i < cardsByPlayers; i++) {
                let randomId = Math.floor(Math.random() * this.cartes.length)
                let randomCard = this.cartes[randomId];
                this.cartes.splice(randomId, 1);
                player.deck.push(randomCard);
            }
        })
    }

    isCarre(card) {

        let gameDeckSize = this.cardPlayed.length
        if (card.power == this.cardPlayed[gameDeckSize - 2].power && card.power == this.cardPlayed[gameDeckSize - 3].power && card.power == this.cardPlayed[gameDeckSize - 4].power) {
            return true
        }

        return false
    }

    canPlay(card) {
        let gameDeckSize = this.cardPlayed.length

        if (card.power == this.cardPlayed[gameDeckSize - 2].power) {
            this.playForced = true
            return;
        }

        if(this.isCarre(card)) {
            this.playForced = false;
            return;
        }

        else {
            this.playForced = false
        }
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
                    list[0].myTurn = true;
                    list[index].myTurn = false;
                    return true;
                }
            }
        }
        return false;
    }

    resetRound() {
        this.cardPlayed = [];
    }

    findOpponent(playerName) {
        let oppoList = []
        for (let player of this.playerList) {
            if (player.name != playerName) {
                oppoList.push(player)
            }
        }
        return oppoList;
    }

    anyonePlayed() {
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].myTurn) {
                return false
            }
        }
        return true;
    }


}

module.exports = {
    PresidentPlayer,
    President
}