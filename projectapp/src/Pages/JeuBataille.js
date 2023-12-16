import React, { useState,useEffect } from 'react';
import io from 'socket.io-client';
import { Navigate, useNavigate } from 'react-router-dom';
import './CSS/jeuBataille.css';


const socket = io.connect("http://localhost:3001")
const JeuBataille= () => {


    const [playerCards, setPlayerCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [initialDeckEmitted, setInitialDeckEmitted] = useState(false);
    const [oldSelect, setOldSelect] = useState(null);
    const [opponents, setOpponents] = useState([]);
    const [scoreboard, setScore] = useState({});
    const [isDraw, setDraw] = useState(false);
    const [inDraw, setInDraw] = useState(false);
    const navigate = useNavigate();

    function leaveGame(){
        socket.emit('leaveGame', sessionStorage.getItem('name'),sessionStorage.getItem('serverConnected'));
        socket.emit('leave', sessionStorage.getItem('serverConnected'));
        navigate('/');
    };

    const selectCardClick = (card) => {

        socket.emit('askGameInfo', sessionStorage.getItem('serverConnected'));

        if(!inDraw && isDraw){
            return 0;
        }

        if(oldSelect != null){
            if(oldSelect != card){
                playerCards.push(oldSelect);
                setOldSelect(playerCards.splice(playerCards.indexOf(card),1)[0]);
            }
            
        } else {
            setOldSelect(playerCards.splice(playerCards.indexOf(card),1)[0]);
        }
        console.log(card);
        setSelectedCards(card);
        if(!inDraw){
            socket.emit('PhaseDeChoix', sessionStorage.getItem("serverConnected"), sessionStorage.getItem("name"), card);
        } else {
            socket.emit('ResoudreEgalite', sessionStorage.getItem("serverConnected"), sessionStorage.getItem("name"), card);
        }
        
    };

    useEffect(() => {
        if (!initialDeckEmitted) {
          socket.emit('WhatIsMyDeck', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
          socket.emit('join', sessionStorage.getItem('serverConnected'));
          socket.emit('askGameInfo', sessionStorage.getItem('serverConnected'));
          setInitialDeckEmitted(true);
        }
    
        socket.on("Deck", (deck) => {
          setPlayerCards(deck);
        });


        socket.on("getInfo", (game) => {
            let plist = [];
            if(game.playerList.length <= 1){
                sessionStorage.setItem('winners',sessionStorage.getItem('name'));
                navigate("/winner");    
            }
            game.playerList.forEach((player) => {

                if(player.name != sessionStorage.getItem("name")){
                    plist.push(player);
                }

            });
            setScore(game.scoreboard);
            setOpponents(plist);

        });

        socket.on('FIN', (fscore,pList) => {
            let winner = [];
            let score = 0;
            pList.forEach(element => {
                if(fscore[element.name] > score){
                    winner = [element.name];
                } else if(fscore[element.name] == score){
                    winner.push(element.name);
                }
            });

            sessionStorage.setItem('winners',winner);
            navigate("/winner");

            

        });

        socket.on('Draw', (drawPlayers,cardIndex) => {
            setDraw(true);
            console.log(drawPlayers);
            socket.emit('WhatIsMyDeck', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
            socket.emit('askGameInfo', sessionStorage.getItem('serverConnected'));
            let ami = false;
            drawPlayers.forEach((player ) => {
                if(player.name == sessionStorage.getItem("name")){
                    ami = true;
                }
            });
            if(ami){
                setInDraw(true);
            } else {
                setInDraw(false);
            }
            setSelectedCards([])

        });
        socket.on('Winner', (winner) => {
            console.log(winner);
            setDraw(false);
            setInDraw(false);
            socket.emit('WhatIsMyDeck', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
            socket.emit('askGameInfo', sessionStorage.getItem('serverConnected'));
            setSelectedCards([]);
        });

        return () => {
          socket.off("Deck");
          socket.off("getInfo");
          socket.off("Winner");
          socket.off("Draw");
        };
      }, [initialDeckEmitted]);


    //return
    return (
        <div className="game-container">
            <button className="save-button">Save</button>

            {/*Opponent player*/}
            <div className="opponent-players">
                {/* Joueurs en haut */}
                {opponents.slice(0, 3).map((opponent, index) => (
                    <div key={index} className="opponent top-opponent">
                        {opponent.name} - Cartes: {opponent.deck.length} - Score : {scoreboard[opponent.name]}
                    </div>
                ))}

                {/* Joueurs à gauche */}
                {opponents.slice(3, 6).map((opponent, index) => (
                    <div key={index} className="opponent left-opponent">
                        {opponent.name} - Cartes: {opponent.deck.length} - Score : {scoreboard[opponent.name]}
                    </div>
                ))}

                {/* Joueurs à droite */}
                {opponents.slice(6, 9).map((opponent, index) => (
                    <div key={index} className="opponent right-opponent">
                        {opponent.name} - Cartes: {opponent.deck.length} - Score : {scoreboard[opponent.name]}
                    </div>
                ))}

            </div>

            {/*les cartes du joueur*/}
            <div className="player-cards">
                {/* map = itere sur chaque carte + vree une element div +transforme chaque element de playerCard en jsx*/}
                {playerCards.map((card, index) => (
                    <div key={index} className={"card"} onClick={() => selectCardClick(card)} >
                        {/*Affiche le symbole et la valeur de la carte sous forme de texte*/}
                        {card.symbole} - {card.number}
                    </div>
                ))}
            </div>

            <div className="selected-cards">
                {selectedCards.symbole} {selectedCards.number}
            </div>


            <button className="leave-button" onClick={() => leaveGame()}>Leave Game</button>
        </div>      
    );
};

export default JeuBataille;



    