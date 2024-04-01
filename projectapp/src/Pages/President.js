import React, { useState, useEffect, useRef } from 'react';
import socket from '../socketG';
import { useNavigate } from 'react-router-dom';
import './CSS/MilleBorne.css'


const MilleBorne = () => {

    const SERVER_ID = sessionStorage.getItem("serverConnected");
    const PLAYER_NAME = sessionStorage.getItem("name");

    let allCard = []

    const cartes = ["crash", "empty", "flat", "limit", "stop", "repair", "gas", "spare", "unlimited", "roll", 'tanker', 'sealant', 'emergency', 'ace', 25, 50, 75, 100, 200, 'back'];

    for (let carte of cartes) {
        const cheminImage = require(`./CSS/svgs/MilleBornes-card-SVG/MB-${carte}.svg`);
        allCard.push(cheminImage);
    }

    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isPopUp, setIsPopUp] = useState(false);
    const [playerList, setPlayerList] = useState([]);
    const [deck, setDeck] = useState([]);
    const [myTurn, setMyTurn] = useState(false);
    const [myPoints, setMyPoints] = useState(0);
    const [bonus, setBonus] = useState(["None"]);
    const [state, setState] = useState("roll");
    const [isLimited, setIsLimited] = useState(false)
    //const [color, setColor] = useState("");
    const [middleCard, setMiddleCard] = useState("roll");
    const [currentCard, setCurrentCard] = useState("");
    const [nbCards, setNbCards] = useState(0);
    const [test, setTest] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const [saveName, setSaveName] = useState("");
    const [isSave, setIsSave] = useState(false);
    const [playerNameEmote, setPlayerNameEmote] = useState("");
    const [EmoteToShow, setEmoteToShow] = useState("");
    const emoteRef = useRef(null); // Référence à la div de l'emote
    const [showEmotes, setShowEmotes] = useState(false);
    const [owner, setOwner] = useState("");

    const toyota = require("./CSS/emotes/toyota.mp4");
    const BOING = require("./CSS/emotes/BOING.mp4");
    const Hampter = require("./CSS/emotes/hampter.mp4");
    const MissInput = require("./CSS/emotes/MissInput.mp4");
    const PutinMewing = require("./CSS/emotes/PutinMEWING.mp4");
    const KillurSelf = require("./CSS/emotes/KillUrSelf.mp4");
    const horse = require("./CSS/emotes/horse.mp4");
    const bookies = require("./CSS/emotes/bookies.mp4");
    const holy = require("./CSS/emotes/holy.mp4");
    const freddy = require("./CSS/emotes/freddy.mp4");
    const NuhUh = require("./CSS/emotes/NuhUh.mp4");
    const hellnaw = require("./CSS/emotes/hellnaw.mp4");
    const hogRider = require("./CSS/emotes/hogRider.mp4");
    const josh = require("./CSS/emotes/josh.mp4");
    const quandale = require("./CSS/emotes/quandale.mp4");
    const mao = require("./CSS/emotes/mao.mp4");
    const bible = require("./CSS/emotes/bible.mp4");
    const spiderman = require("./CSS/emotes/spiderman.mp4");
    const goku = require("./CSS/emotes/goku.mp4");
    const gatorade = require("./CSS/emotes/gatorade.mp4");
    const dj = require("./CSS/emotes/dj.mp4");
    const jumpascare = require("./CSS/emotes/jumpascare.mp4");

    const videos = [
        { id: 1, videoUrl: toyota },
        { id: 2, videoUrl: BOING },
        { id: 3, videoUrl: Hampter },
        { id: 4, videoUrl: MissInput },
        { id: 5, videoUrl: PutinMewing },
        { id: 6, videoUrl: KillurSelf },
        { id: 7, videoUrl: horse },
        { id: 8, videoUrl: bookies },
        { id: 9, videoUrl: holy },
        { id: 10, videoUrl: freddy },
        { id: 11, videoUrl: NuhUh },
        { id: 12, videoUrl: hellnaw },
        { id: 13, videoUrl: hogRider },
        { id: 14, videoUrl: josh },
        { id: 15, videoUrl: quandale },
        { id: 16, videoUrl: mao },
        { id: 17, videoUrl: bible },
        { id: 18, videoUrl: spiderman },
        { id: 19, videoUrl: goku },
        { id: 20, videoUrl: gatorade },
        { id: 21, videoUrl: dj },
        { id: 22, videoUrl: jumpascare },
    ];

    const handleVideoEnd = () => {
        if (emoteRef.current) {
            emoteRef.current.hidden = true; // Cache la div en ajustant l'attribut `hidden`
        }

    };



    function showEnemyEmote(opponentName) {
        if (opponentName === playerNameEmote) {
            return true;
        }
        return false;
    }


    
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
    const toggleInfo = () => {
        setShowInfo(prevShowInfo => !prevShowInfo);
    };

    const sendMessage = () => {
        socket.emit('sendMessage', { name: sessionStorage.getItem("name"), msg: message, serverId: sessionStorage.getItem("serverConnected") });
        setMessage('');
    }

    useEffect(() => {

        let mounted = true;
        let failed = false;

        if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected") == null) {
            navigate("/login-signup");
            failed = true;
        }
        if (mounted && !failed) {

            // socket.emit('join', sessionStorage.getItem('serverConnected'));
            socket.emit("P-whatMyOpponent", SERVER_ID, PLAYER_NAME );
            socket.emit("P-whatOrder", SERVER_ID, PLAYER_NAME );
            socket.emit("P-whatMyDeck", PLAYER_NAME);
            socket.emit("P-whatCardPlayed",PLAYER_NAME);

            // socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"));
            // socket.emit("loadTheChat", sessionStorage.getItem("serverConnected"));
            // socket.emit("whaIsOwner", sessionStorage.getItem("serverConnected"));
        }

        return () => {
            mounted = false;
        }
    }, [navigate, state, test])


    useEffect(() => {

        let mounted = true;
        let failed = false;

        if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected") == null) {
            navigate("/login-signup");
            failed = true;
        }
        if (mounted && !failed) {

            socket.on("yourDeck", (myDeck) => {
                console.log(myDeck);
                setDeck(myDeck);
            });

            socket.on("yourOpponents", (opponents) => {
                setPlayerList(opponents);
            })

            socket.on("myTurn", (bool) => {
                setMyTurn(bool);
            })

            socket.on("P-cardPlayed", (cardPlayed) => {
                setMiddleCard(cardPlayed);
            })

            socket.on("showRestart", () => {
                setMyTurn(false);
                setTimeout(() => {
                    socket.emit("restartRound", SERVER_ID);
                }, "3000")
            })

            socket.on("askTurnInfo", () => {
                socket.emit("P-whatMyTurn", SERVER_ID, PLAYER_NAME);
            });


        }
        return () => {
            mounted = false;

        }
    }, [navigate, state, test, isLimited]);


    const Popup = () => {
        useEffect(() => {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3000);

            return () => clearTimeout(timer);
        }, []);

        return (
            <div>
                <div className={`popup red ${isVisible ? 'visible' : ''} `}>
                    <p>VOUS AVEZ ÉTÉ ATTAQUÉ </p>
                </div>

            </div>
        );
    };

    const playCard = (card) => {
        setCurrentCard(card);
        socket.emit("P-playCard", SERVER_ID, PLAYER_NAME, card);

    }


    const leave = () => {
        socket.emit("MB-leaveGame", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
        socket.emit('leave', sessionStorage.getItem('serverConnected'));
        navigate('/BrowserManager');
    }

    const saveGame = () => {
        setIsSave(false);
        socket.emit("saveGame", sessionStorage.getItem("serverConnected"), saveName, sessionStorage.getItem("name"))
    }

    const openSavePopUp = () => {
        setIsSave(true);
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

            try {

                document.addEventListener('click', getElementId);
                document.getElementById("inputChat").addEventListener('keydown', sendMessageOnEnter);

            } catch (err) {

                console.log("meh");

            }

            return () => {

                try {

                    document.removeEventListener('click', getElementId);
                    document.getElementById("inputChat").removeEventListener('keydown', sendMessageOnEnter);

                } catch (err) {

                    console.log("meh");

                }


            };
        }, []);

        return (
            <div></div>
        );
    }

    useEffect(() => {
        const messageContainer = document.querySelector('.MB-message-container');
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }, [messages]);


    return (
        <div className='MB-container'>

            {isSave && (
                <div className='savePopUp'>
                    <h1 className='titlePopUp'> Entrer le nom de la save : </h1>
                    <input className="inputPopup" type="text" placeholder='save Name' onChange={(e) => setSaveName(e.target.value)}></input>
                    <div className="saveButtonPopUp" onClick={() => saveGame()}>Sauvergarder</div>
                </div>
            )}

            {isVisible && <Popup />}

            <YourComponent></YourComponent>

            <div className='MB-adversaire-container-upper-bandeau'>
                <div className='exitAndSave-container'>
                    <div className='MB-exit-button' onClick={() => leave()}> QUITTER</div>
                    {owner === sessionStorage.getItem("name") && <div className='MB-exit-button' onClick={() => openSavePopUp()}> Sauvergarder</div>}
                </div>

                {showEnemyEmote(sessionStorage.getItem("name")) && (
                    <div className='bo-player-emote-container'>
                        <div className="bo-player-emote" >
                            <video src={EmoteToShow} autoPlay onEnded={handleVideoEnd} />
                        </div>
                    </div>
                )}


                {playerList.map((player, index) => (
                    <div className={`MB-adversaire-container MB-p${index + 1}  ${player.myTurn ? "myTurn" : ""}`} key={index}>
                        <div className='MB-adversaire-card'>
                            <div className={`MB-adversaire ${player.color}`}>
                                <div className='MB-player-name'>{player.name}</div>
                            </div>
                            <div className='info-container'>
                                <div>Nombre de points : {player.nbPoints}</div>
                                <br></br>
                                <div>Bonus : {player.bonus.join(', ')}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>



            <div className='middleCard-container'>
                <div className='la-ou-on-pose-les-cartes-tmtc'>
                    <img alt='' src={getCardImage("")} className="carte-milieu"></img>
                </div>

                <div className='pioche-container'>
                    <div className='pioche'>{nbCards}
                        <div className='MB-pioche-petit'>cartes</div>
                        <div className='MB-pioche-petit'>restante</div>
                    </div>
                </div>
            </div>


            <div className='MB-card-holder-container'>
                <div className={`me-container ${myTurn ? "myTurn" : ""}`}>
                    <div className='state-container'>
                        <div className={`my-card ${"red"}`}>
                            <div className='MB-player-name'> {sessionStorage.getItem("name")}</div>
                            <div className='info-container'>

                            </div>
                        </div>
                    </div>

                </div>

                <div className='MB-card-holder'>
                    {deck.map((carte) => (

                        <img alt='' src={getCardImage(carte)} className="player-card" onClick={() => myTurn ? playCard(carte) : null}></img>
                    )
                    )}
                </div>

                <div className="chat-container" id='chatContainer'>
                    <div className='message-container MB-message-container' >
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
        </div>
    )
}


export default MilleBorne;



