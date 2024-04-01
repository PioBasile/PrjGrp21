import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/jeuBataille.css';
import socket from '../socketG';
import './CSS/emotes/toyota.mp4';
import { on } from 'events';


const JeuBataille = () => {
    const SERVER_ID = sessionStorage.getItem("serverConnected")
    const [playerCards, setPlayerCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState({ symbole: 'mathis', number: '1000', power: -1 });
    const [opponents, setOpponents] = useState([]);
    const [scoreboard, setScore] = useState({});
    const [showAll, setShowAll] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();
    const [allCardPlayed, setAllCardPlayed] = useState([]);

    const emoteBubbleRef = useRef(null);
    const [showEmotes, setShowEmotes] = useState(false);
    const [canPlay, setCanPlay] = useState(true);
    const [playerNameEmote, setPlayerNameEmote] = useState("");
    const [EmoteToShow, setEmoteToShow] = useState("");
    const emoteRef = useRef(null); // Référence à la div de l'emote
    const [myEmotes, setMyEmotes] = useState([]);

    const [saveName, setSaveName] = useState("");
    const [isSave, setIsSave] = useState(false);
    const [owner, setOwner] = useState("");
    const backCardsImageTest = require("./CSS/pics/PNG-cards-1.3/blue.png")

    const [isVisible, setIsVisible] = useState(false);
    const [roundWinner, setRoundWinner] = useState("");

    //----------------------EMOTES---------------------

    const [videos, setVideos] = useState([
        { id: 1, videoUrl: require("./CSS/emotes/toyota.mp4") },
        { id: 2, videoUrl: require("./CSS/emotes/BOING.mp4") },
        { id: 3, videoUrl: require("./CSS/emotes/hampter.mp4") },
        { id: 4, videoUrl: require("./CSS/emotes/MissInput.mp4") },
        { id: 5, videoUrl: require("./CSS/emotes/PutinMEWING.mp4") },
        { id: 6, videoUrl: require("./CSS/emotes/KillUrSelf.mp4") },
        { id: 7, videoUrl: require("./CSS/emotes/horse.mp4") },
        { id: 8, videoUrl: require("./CSS/emotes/holy.mp4") },
        { id: 9, videoUrl: require("./CSS/emotes/holy.mp4") },
        { id: 10, videoUrl: require("./CSS/emotes/freddy.mp4") },
        { id: 11, videoUrl: require("./CSS/emotes/NuhUh.mp4") },
        { id: 12, videoUrl: require("./CSS/emotes/hellnaw.mp4") },
        { id: 13, videoUrl: require("./CSS/emotes/hogRider.mp4") },
        { id: 14, videoUrl: require("./CSS/emotes/josh.mp4") },
        { id: 15, videoUrl: require("./CSS/emotes/quandale.mp4") },
        { id: 16, videoUrl: require("./CSS/emotes/mao.mp4") },
        { id: 17, videoUrl: require("./CSS/emotes/bible.mp4") },
        { id: 18, videoUrl: require("./CSS/emotes/spiderman.mp4") },
        { id: 19, videoUrl: require("./CSS/emotes/goku.mp4") },
        { id: 20, videoUrl: require("./CSS/emotes/gatorade.mp4") },
        { id: 21, videoUrl: require("./CSS/emotes/dj.mp4") },
        { id: 22, videoUrl: require("./CSS/emotes/jumpascare.mp4") },
    ]);

    const handleVideoEnd = () => {
        if (emoteRef.current) {
            emoteRef.current.style.display = 'none';
            setPlayerNameEmote("")
        }
    };

    function playEmote(emoteUrl) {
        socket.emit('sendEmoteToLobby', { emote: emoteUrl.id, playerName: sessionStorage.getItem('name'), serverId: sessionStorage.getItem('serverConnected') });
    }

    const toggleEmotes = () => {
        if (showEmotes) setShowEmotes(false);
        else setShowEmotes(true)
    };

    function showEnemyEmote(opponentName) {
        if (opponentName === playerNameEmote) {
            return true;
        }
        return false;
    }

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
        if (numeros.includes(card.number)) {
            const chemin = require(`./CSS/pics/PNG-cards-1.3/${card.number}_of_${translateSymbol}.png`);
            return chemin;
        }
        else if (card.number !== "As") {
            const translateNumber = cardNumbTranslateSup10(card.number);
            const chemin = require(`./CSS/pics/PNG-cards-1.3/${translateNumber}_of_${translateSymbol}2.png`);
            return chemin;
        }
        else {
            const chemin = require(`./CSS/pics/PNG-cards-1.3/ace_of_${translateSymbol}.png`);
            return chemin;
        }
    }

    //----------------------CHAT---------------------

    const sendMessage = () => {
        socket.emit('sendMessage', { name: sessionStorage.getItem("name"), msg: message, serverId: sessionStorage.getItem("serverConnected") });
        setMessage('');
    }

    function YourComponent() {
        useEffect(() => {
            let chatContainer = document.getElementById("bo-chatContainer");
            if (chatContainer == null) { return 0; }

            function getElementId(event) {
                var clickedElementId = event.target.id;
                if (clickedElementId === "bo-inputChat") {
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

            try {

                document.addEventListener('click', getElementId);
                document.getElementById("bo-inputChat").addEventListener('keydown', sendMessageOnEnter);

            } catch (err) {

                console.log("meh");

            }

            return () => {

                try {

                    document.removeEventListener('click', getElementId);
                    document.getElementById("bo-inputChat").removeEventListener('keydown', sendMessageOnEnter);

                } catch (err) {

                    console.log("meh");

                }


            };

        }, []);

        return (
            <div></div>
        );
    }


    //----------------------LEAVE GAME---------------------

    function leaveGame() {
        socket.emit('BTL-leaveGame', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
        socket.emit('leave', sessionStorage.getItem('serverConnected'));
        navigate('/BrowserManager');
    };

    const saveGame = () => {
        setIsSave(false);
        socket.emit("saveGame", sessionStorage.getItem("serverConnected"), saveName, sessionStorage.getItem("name"))
    }

    const openSavePopUp = () => {
        setIsSave(true);
    }


    //----------------------SORT CARDS---------------------
    function sortCards(deck) {
        let grp1 = [];
        let grp2 = [];
        let grp3 = [];
        let grp4 = [];

        deck.forEach((card) => {

            card.symbole = card.symbole.charAt(0).toUpperCase() + card.symbole.slice(1);
            card.number = card.number.charAt(0).toUpperCase() + card.number.slice(1);


            if (card.symbole === "Trefle") {
                grp1.push(card);
            } else if (card.symbole === "Carreau") {
                grp2.push(card);
            } else if (card.symbole === "Coeur") {
                grp3.push(card);
            } else if (card.symbole === "Pique") {
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
        setSelectedCard(card);
        socket.emit("playCard", sessionStorage.getItem("serverConnected"), card, sessionStorage.getItem("name"));
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
            socket.emit("loadTheChat", sessionStorage.getItem("serverConnected"));
            socket.emit("whaIsOwner", sessionStorage.getItem("serverConnected"));
            socket.emit("loadCardsPlayed", sessionStorage.getItem("serverConnected"));
            socket.emit("whatsMyEmotes", sessionStorage.getItem("name"));

        }
        return () => {
            mounted = false;
        }

    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emoteBubbleRef.current && !emoteBubbleRef.current.contains(event.target)) {
                socket.emit("endEmote", SERVER_ID);
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

            socket.on("owner", (ownerFromServer) => {
                setOwner(ownerFromServer)
            });
            socket.on("showAll", () => {
                setShowAll(true);
            });

            socket.on("Deck", (deck) => {
                sortCards(deck);
            });

            socket.on("canPlay?", (bool) => {
                setCanPlay(bool)
            })

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


            socket.on("yourDeck", () => {
                socket.emit("whatMyDeck", sessionStorage.getItem("serverConnected"), sessionStorage.getItem("name"))
            })

            socket.on("resolveRoundAsk", () => {
                socket.emit("showAllAsk",sessionStorage.getItem("serverConnected"))
                setTimeout(() => {
                    socket.emit("resolveRound", sessionStorage.getItem("serverConnected"), sessionStorage.getItem("name"));
                }, "3000");
            });

            socket.on("resolveDrawAsk", () => {
                socket.emit("showAllAsk",sessionStorage.getItem("serverConnected"))
                setTimeout(() => {
                    socket.emit("resolveDrawFirstPart", sessionStorage.getItem("serverConnected"));
                }, "3000");
            });

            socket.on("showAll", () => {
                setShowAll(true);
            })

            socket.on("resolveDrawAfter", () => {
                setTimeout(() => {
                    socket.emit("resolveDraw", sessionStorage.getItem("serverConnected"));
                }, '3000');
            });

            socket.on("fin", (winner) => {
                console.log(winner);
                sessionStorage.setItem("winners", winner);
                navigate("/winner");

            })

            socket.on("getMessage", (msgList) => {
                setMessages(msgList);
            })

            socket.on("roundCardsPlayed", (cardPlayedList) => {
                setAllCardPlayed(Object.values(cardPlayedList));
            })

            socket.on("emote", (emote, opponentName) => {

                let video = 0;
                videos.forEach((videos) => {

                    if (videos.id === emote) {
                        video = videos;
                    }

                });
                if (video === 0) {
                    return;
                }

                console.log(video, opponentName);

                setEmoteToShow(video.videoUrl);
                setPlayerNameEmote(opponentName);
            });

            socket.on("reset", () => {
                console.log("reset")
                setAllCardPlayed([]);
                setCanPlay(true);
                setShowAll(false);
            })

            socket.on("endEmoteToAll", () => {
                setPlayerNameEmote("");
            })

            socket.on("roundWinner", (winnerName) => {
                setRoundWinner(winnerName);
                setIsVisible(true);
            })

            socket.on("yourEmotes", (emotesList) => {
                if(emotesList != null){
                    const videoFilter = videos.filter(video => {
                        return emotesList.some(video2 => video2 === video.id);
                        
                    });
                    setVideos(videoFilter);
                }
                else{
                    setVideos([]);
                }
                // setMyEmotes(listOfEmote);
            })
        }



        return () => {
            mounted = false;
            socket.off("Deck");
            socket.off("owner");
            socket.off("emote");
            socket.off("canPlay?");
            socket.off("yourDeck");
            socket.off('getMessage');
            socket.off("resolveDrawAsk");
            socket.off("resolveRoundAsk");
            socket.off("resolveDrawAfter");
            socket.off("roundCardsPlayed");
            socket.off("reset");
            socket.off("endEmoteToAll");
            socket.off("fin");
            socket.on("showAll");
        };
    }, []);

    const handleSaveNameChange = (e) => {
        const inputValue = e.target.value;
        const filteredValue = inputValue.replace(/[^a-zA-Z0-9]/g, '');
        setSaveName(filteredValue);
    };

    const Popup = () => {
        useEffect(() => {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setRoundWinner("");
            }, 2000);

            return () => clearTimeout(timer);
        }, []);

        return (
            <div>
                <div className={`popup ${isVisible ? 'visible' : ''} `}>
                    <p>{`${roundWinner} a gagné la manche`}</p>
                </div>

            </div>
        );
    };

    useEffect(() => {
        const messageContainer = document.querySelector('.bo-message-container');
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }, [messages]);


    //----------------------RETURN---------------------
    return (
        <div className="bo-game-container">

            {isSave && (
                <div className='savePopUp'>
                    <h1 className='titlePopUp'> Entrer le nom de la save : </h1>
                    <input className="inputPopup" type="text" placeholder='save Name' value={saveName} onChange={handleSaveNameChange} />
                    <div className="saveButtonPopUp" onClick={() => saveGame()}>Sauvergarder</div>
                </div>
            )}

            <YourComponent></YourComponent>

            {isVisible && <Popup />}

            {showEnemyEmote(sessionStorage.getItem("name")) && (
                <div className='bo-player-emote-container' ref={emoteRef}>
                    <div className="bo-player-emote" >
                        <video src={EmoteToShow} autoPlay onEnded={handleVideoEnd} />
                    </div>
                </div>
            )}


            {/*Opponent player*/}
            <div className="bo-opponent-players">
                {/* Joueurs en haut */}
                {opponents.slice(0, 5).map((opponent, index) => (
                    <div key={index} className="bo-opponent bo-top-opponent">
                        <strong>{opponent.name}</strong>
                        Cartes: {opponent.deck.length} <br />
                        Score : {scoreboard[opponent.name]}
                        {showEnemyEmote(opponent.name) && (
                            <div className='bo-enem-emote-top' ref={emoteRef}>
                                <div className="bo-emote-enemy">
                                    {console.log(EmoteToShow)}
                                    <video src={EmoteToShow} autoPlay onEnded={handleVideoEnd} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Joueurs à gauche */}
                {opponents.slice(5, 7).map((opponent, index) => (
                    <div key={index} className="bo-opponent bo-left-opponent">
                        <strong>{opponent.name}</strong>
                        Cartes: {opponent.deck.length} <br />
                        Score : {scoreboard[opponent.name]}
                        {showEnemyEmote(opponent.name) && (
                            <div className='bo-enem-emote-left' ref={emoteRef}>
                                <div className="bo-emote-enemy" >
                                    {console.log(EmoteToShow)}
                                    <video src={EmoteToShow} autoPlay onEnded={handleVideoEnd} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Joueurs à droite */}
                {opponents.slice(7, 9).map((opponent, index) => (
                    <div key={index} className="bo-opponent bo-right-opponent">
                        <strong>{opponent.name}</strong>
                        Cartes: {opponent.deck.length} <br />
                        Score : {scoreboard[opponent.name]}
                        {showEnemyEmote(opponent.name) && (
                            <div className='bo-enem-emote-right' ref={emoteRef}>
                                <div className="bo-emote-enemy" >
                                    {console.log(EmoteToShow)}
                                    <video src={EmoteToShow} autoPlay onEnded={handleVideoEnd} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

            </div>

            {/*les cartes du joueur*/}
            <div className="bo-player-cards-holder">
                <div className="bo-player-cards">
                    {playerCards.map((card, index) => (
                        <div key={index} className={"bo-card"} onClick={() => !canPlay ? null : selectCardClick(card)} >
                            {/* {card.symbole} <br />
                            {card.number}*/}
                            <img src={getCardImage(card)} alt="Carte" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bo-user-info-container">
                <div className="bo-user-info">
                    Mon Score : {scoreboard[sessionStorage.getItem("name")]}
                </div>
                <div className="bo-user-info">
                    Nombre de cartes : {playerCards.length}
                </div>
            </div>

            {/*les cartes selectionnées*/}
            <div className="bo-selected-cards">
                <div className={"bo-selected-card"}>
                    {
                        allCardPlayed.map((card, index) => (
                            // <img alt='r' src={(selectedCards.length !== 0 || inDraw) && !isDraw ? getCardImage(card) : backCardsImageTest} />
                            <img alt='r' src={((selectedCard.power === card.power && selectedCard.symbole === card.symbole) || showAll) ? getCardImage(card) : backCardsImageTest} />


                        ))
                    }
                </div>
            </div>

            {owner === sessionStorage.getItem("name") &&
                <button className="bo-save-button" onClick={() => openSavePopUp()}>Sauvergarder</button>
            }

            <button className="bo-leave-button" onClick={() => leaveGame()}>QUITTER</button>

            <div className="bo-emote-container">
                <button className="bo-emote-button" onClick={toggleEmotes}>Emotes</button>
                {showEmotes && (
                    <div className="bo-emote-bubble" ref={emoteBubbleRef}>
                        <div className="bo-emote-list">
                            {videos.map((emote, index) => (
                                <div key={index} className="bo-emote" onClick={() => playEmote(emote)}>
                                    <video src={emote.videoUrl} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bo-chat-container" id='bo-chatContainer'>
                <div className='bo-message-container' >
                    {messages.map((msg, index) => (
                        <p key={index}>{msg}</p>)
                    )}
                    <input
                        id="bo-inputChat"
                        className='bo-inputMessage'
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
