import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/jeuBataille.css';
import socket from '../socketG';
import './CSS/emotes/toyota.mp4';


const JeuBataille = () => {

    const [playerCards, setPlayerCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [oldSelect, setOldSelect] = useState(null);
    const [opponents, setOpponents] = useState([]);
    const [scoreboard, setScore] = useState({});
    const [isDraw, setDraw] = useState(false);
    const [inDraw, setInDraw] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();
    const emoteBubbleRef = useRef(null);
    const [showEmotes, setShowEmotes] = useState(false);
    const [allCardPlayed, setAllCardPlayed] = useState([]);


    const backCardsImageTest = require("./CSS/pics/PNG-cards-1.3/astronaut.png")



    /* ------------A FAIRE--------------

        2. faire en sorte que les cartes soient au milieu if selected avec les autres 
           opponents , puis les retourner quand tout le monde place leur carte.
           A divise la partie du milieu en 2 (5 par 5 avec le nom du joueur en dessous de chaque
            carte) A separe avec une ligne horizontale au milieu clean
        4. faire les emotes , choisir un bouton a maintenir pour les emotes ou faire comme clash royal
        
        
        -----PAGE DE WINNER------
        3. ajouter le score de chaque joueur/classement
    */

    //----------------------EMOTES---------------------
    const emote = require("./CSS/emotes/toyota.mp4");

    const videos = [
        { name: 'Emote 1', videoUrl: emote },
        { name: 'Emote 2', videoUrl: emote },
        { name: 'Emote 3', videoUrl: emote },
        { name: 'Emote 4', videoUrl: emote },
        { name: 'Emote 5', videoUrl: emote },
        { name: 'Emote 6', videoUrl: emote },
        { name: 'Emote 7', videoUrl: emote },
        { name: 'Emote 8', videoUrl: emote },
    ];

    function playEmote(emoteUrl) {
        const video = emoteBubbleRef.current.querySelector('video'); 
        video.src = emoteUrl; 
        video.play(); 
        
        video.addEventListener('ended', () => {
            video.currentTime = 0; 
        });
    }

    const toggleEmotes = () => {
        setShowEmotes(!showEmotes);
      };

    //----------------------FONCTION PR LES IMAGES DE CARTES---------------------

    function cardSymbTranslate(symbole) {
        switch (symbole) {
            case "Carreau":
                return "clubs";
            case "Pique":
                return "spades";
            case "Coeur":
                return "hearts";
            case "Trefle":
                return "diamonds";
            default:
                return symbole;
        }
    }

    function cardNumbTranslateSup10(number) {
        switch (number) {
            case "V":
                return "jack";
            case "Reine":
                return "queen";
            case "Roi":
                return "king";
            case "As":
                return "ace";
            default:
                return -1;
        }
    }
    

    function getCardImage(card) {
        const numeros = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
        const translateSymbol = cardSymbTranslate(card.symbole);
        if(numeros.includes(card.number)){
            const chemin = require(`./CSS/pics/PNG-cards-1.3/${card.number}_of_${translateSymbol}.png`);
            return chemin;
        }
        else if(card.number !== "As"){
            const translateNumber = cardNumbTranslateSup10(card.number);
            const chemin= require(`./CSS/pics/PNG-cards-1.3/${translateNumber}_of_${translateSymbol}2.png`);
            return chemin;
        }
        else{
            const chemin = require(`./CSS/pics/PNG-cards-1.3/ace_of_${translateSymbol}.png`);
            return chemin;
        }
    }

    //----------------------CHAT---------------------

    const sendMessage = () => {
        socket.emit('BTL-sendMessage', { name: sessionStorage.getItem("name"), msg: message, serverId: sessionStorage.getItem("serverConnected") });
        setMessage('');
    }

    function YourComponent() {
        useEffect(() => {
            let chatContainer = document.getElementById("chatContainer");
            if (chatContainer == null) { return 0; }

            function getElementId(event) {
                var clickedElementId = event.target.id;
                if (clickedElementId === "inputChat") {
                    chatContainer.style.opacity = 1;
                } else {
                    chatContainer.style.opacity = 0.33;
                }
                return clickedElementId;
            }

            function sendMessageOnEnter(event) {
                if (event.key === "Enter") {
                    sendMessage();
                }
            }

            document.addEventListener('click', getElementId);

            document.getElementById("inputChat").addEventListener('keydown', sendMessageOnEnter);
            

            return () => {
                document.removeEventListener('click', getElementId);
                document.getElementById("inputChat").removeEventListener('keydown', sendMessageOnEnter);

            };
        }, []);
        return <div></div>

    }


    //----------------------LEAVE GAME---------------------

    function leaveGame() {
        socket.emit('leaveGame', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
        socket.emit('leave', sessionStorage.getItem('serverConnected'));
        navigate('/BrowserManager');
    };

    //----------------------SORT CARDS---------------------
    function sortCards(deck) {
        let grp1 = [];
        let grp2 = [];
        let grp3 = [];
        let grp4 = [];

        deck.forEach((card) => {

            card.symbole = card.symbole.charAt(0).toUpperCase() + card.symbole.slice(1);
            card.number = card.number.charAt(0).toUpperCase() + card.number.slice(1);
            

            if(card.symbole === "Trefle"){
                grp1.push(card);
            } else if(card.symbole === "Carreau"){
                grp2.push(card);
            } else if(card.symbole === "Coeur"){
                grp3.push(card);
            } else if(card.symbole === "Pique"){
                grp4.push(card);
            }

        });

        const sortByPower = (a, b) => {
            return a.power - b.power;
        };
        
        // Tri par symbole de carte
        const sortGroupBySymbol = (group) => {
            return group.sort(sortByPower);
        };


        grp1 = sortGroupBySymbol(grp1);
        grp2 = sortGroupBySymbol(grp2);
        grp3 = sortGroupBySymbol(grp3);
        grp4 = sortGroupBySymbol(grp4);
    

        deck = grp1.concat(grp2, grp3, grp4);
    

        setPlayerCards(deck);
    }

    //----------------------SELECT CARD---------------------<

    const selectCardClick = (card) => {

        socket.emit('askGameInfo', sessionStorage.getItem('serverConnected'));

        if (!inDraw && isDraw) {
            return 0;
        }

        if (oldSelect != null) {
            if (oldSelect !== card) {
                playerCards.push(oldSelect);
                setOldSelect(playerCards.splice(playerCards.indexOf(card), 1)[0]);
            }

        } else {
            setOldSelect(playerCards.splice(playerCards.indexOf(card), 1)[0]);
        }
        sortCards(playerCards);
        setSelectedCards(card);
        if (!inDraw) {
            socket.emit("sendCard", {serverId:sessionStorage.getItem("serverConnected"), name:sessionStorage.getItem("name"),card:card, oldSelect:oldSelect});
            setTimeout(() => {
                socket.emit('PhaseDeChoix', sessionStorage.getItem("serverConnected"), sessionStorage.getItem("name"), card);
            }, "3000")

        } else { 
            socket.emit("sendCard", {serverId:sessionStorage.getItem("serverConnected"), name:sessionStorage.getItem("name"),card:card, oldSelect:oldSelect});
            setTimeout(() => {

                socket.emit('ResoudreEgalite', {serverId:sessionStorage.getItem("serverConnected"),  card:card});
            }, "3000")
        }

    };

    //----------------------USE EFFECT---------------------

    useEffect(() => {

        let mounted = true;
        let failed = false;

        if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected") == null) {
            navigate("/login-signup");
            failed = true;
        }
        if (mounted && !failed) {

            // GESTION stabilité de la connection
            socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"))


            socket.emit('WhatIsMyDeck', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
            socket.emit('join', sessionStorage.getItem('serverConnected'));
            socket.emit('askGameInfo', sessionStorage.getItem('serverConnected'));
            socket.emit("BTL-loadTheChat", sessionStorage.getItem("serverConnected"));

        }
        return () => {
            mounted = false;
        }

    },[navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (emoteBubbleRef.current && !emoteBubbleRef.current.contains(event.target)) {
            setShowEmotes(false);
          }
        };
    
        if (showEmotes) {
          document.addEventListener('mousedown', handleClickOutside);
        } else {
          document.removeEventListener('mousedown', handleClickOutside);
        }
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmotes]);

    useEffect(() => {

        let mounted = true;
        if (mounted) {
            // GESTION stabilité de la connection
            socket.on("deco", (name) => {
                navigate("/login-signup");
            });

            // -----------------

            socket.on("Deck", (deck) => {
                
                sortCards(deck);
            });


            socket.on("getInfo", (game) => {
                let plist = [];
                if (game.playerList.length <= 1) {
                    sessionStorage.setItem('winners', sessionStorage.getItem('name'));
                    navigate("/winner");
                }
                game.playerList.forEach((player) => {

                    if (player.name !== sessionStorage.getItem("name")) {
                        plist.push(player);
                    }

                });
                setScore(game.scoreboard);
                setOpponents(plist);

            });

            socket.on('FIN', (fscore, pList) => {
                let winner = [];
                let score = 0;
                pList.forEach(element => {
                    if (fscore[element.name] > score) {
                        winner = [element.name];
                    } else if (fscore[element.name] === score) {
                        winner.push(element.name);
                    }
                });

                sessionStorage.setItem('winners', winner);
                navigate("/winner");



            });

            socket.on('Draw', (drawPlayers, cardIndex) => {
                setDraw(true);
                console.log(drawPlayers);
                socket.emit('WhatIsMyDeck', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
                socket.emit('askGameInfo', sessionStorage.getItem('serverConnected'));
                let ami = false;
                drawPlayers.forEach((player) => {
                    if (player.name === sessionStorage.getItem("name")) {
                        ami = true;
                    }
                });
                if (ami) {
                    setInDraw(true);
                } else {
                    setInDraw(false);
                }
                setSelectedCards([])

            });
            socket.on('Winner', (winner) => {
                setDraw(false);
                setInDraw(false);
                socket.emit('WhatIsMyDeck', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
                socket.emit('askGameInfo', sessionStorage.getItem('serverConnected'));
                setSelectedCards([]);
            });

            socket.on("BTL-getMessage", (msgList) => {
                setMessages(msgList);
            })

        }

        socket.on("roundCardsPlayed", (cardPlayedList) => {
            console.log("CARD PLAYDE LIST ", cardPlayedList);
            setAllCardPlayed(Object.values(cardPlayedList));
        })

        socket.on("deco", (name) => {

            navigate("/BrowserManager");

        });

        return () => {
            mounted = false;
            socket.off("Deck");
            socket.off("getInfo");
            socket.off("Winner");
            socket.off("Draw");
            socket.off("FIN");
            socket.off('BTL-getMessage');
        };
    }, [navigate]);


    //----------------------RETURN---------------------
    return (
        <div className="bo-game-container">

            <YourComponent></YourComponent>


            {/*Opponent player*/}
            <div className="bo-opponent-players">
                {/* Joueurs en haut */}
                {opponents.slice(0, 5).map((opponent, index) => (
                    <div key={index} className="bo-opponent bo-top-opponent">
                        <strong>{opponent.name}</strong> 
                        Cartes: {opponent.deck.length} <br />
                        Score : {scoreboard[opponent.name]}
                    </div>
                ))}

                {/* Joueurs à gauche */}
                {opponents.slice(5, 7).map((opponent, index) => (
                    <div key={index} className="bo-opponent bo-left-opponent">
                        <strong>{opponent.name}</strong> 
                        Cartes: {opponent.deck.length} <br />
                        Score : {scoreboard[opponent.name]}
                    </div>
                ))}

                {/* Joueurs à droite */}
                {opponents.slice(7, 9).map((opponent, index) => (
                    <div key={index} className="bo-opponent bo-right-opponent">
                        <strong>{opponent.name}</strong>
                        Cartes: {opponent.deck.length} <br />
                        Score : {scoreboard[opponent.name]}
                    </div>
                ))}

            </div>

            {/*les cartes du joueur*/}
            <div className="bo-player-cards-holder"> 
                <div className="bo-user-info-container">
                    <div className="bo-user-info">
                        Mon Score : {scoreboard[sessionStorage.getItem("name")]} 
                    </div>
                    <div className="bo-user-info">
                        Nombre de cartes : {playerCards.length}
                    </div>
                </div>
                <div className="bo-player-cards">
                    {playerCards.map((card, index) => (
                        <div key={index} className={"bo-card"} onClick={() => selectCardClick(card)} >
                            {/* {card.symbole} <br />
                            {card.number}*/}
                            <img src={getCardImage(card)} alt="Carte" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bo-selected-cards">
                <div className={"bo-selected-card"}>
                    {
                    allCardPlayed.map((card, index) => (
                        <img src={ selectedCards.length !== 0 || inDraw ? getCardImage(card) : backCardsImageTest} /> 
                        ))
                    }  
                </div>
            </div>

            <button className="bo-save-button" onClick={() => leaveGame()}>Save</button>
            <button className="bo-leave-button" onClick={() => leaveGame()}>Leave Game</button>

            <div className="bo-emote-container">
                <button className="bo-emote-button" onClick={toggleEmotes}>Emotes</button>
                {showEmotes && (
                    <div className="bo-emote-bubble" ref={emoteBubbleRef}>
                    <div className="bo-emote-list">
                        {videos.map((emote, index) => (
                            <div key={index} className="bo-emote" onClick={() => playEmote(emote.videoUrl)}>
                                <video src={emote.videoUrl} />
                            </div>
                        ))}
                    </div>
                    </div>
                )}
            </div>

            <div className="chat-container" id='chatContainer'>
                <div className='message-container bo-message-container' >
                    {messages.map((msg, index) => (
                        <p key={index}>{msg}</p>)
                    )}
                    <input
                        id="inputChat"
                        className='inputMessage'
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type message..."
                    />
                </div>
            </div>

        </div>
    );
};

export default JeuBataille;
