import React, { useState, useEffect } from 'react';
import socket from '../socketG';
import { useNavigate } from 'react-router-dom';
import './CSS/MilleBorne.css'


const MilleBorne = () => {


    let allCard = []

    const cartes = ["crash", "empty", "flat", "limit", "stop", "repair", "gas", "spare", "unlimited", "roll", 'tanker', 'sealant', 'emergency', 'ace', 25, 50, 75, 100, 200, 'back'];

    for (let carte of cartes) {
        const cheminImage = require(`./CSS/MilleBornes-card-SVG/MB-${carte}.svg`);
        allCard.push(cheminImage);
    }

    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(["CHAT", "CHAT" ,"CHAT" ,"CHAT"]);
    const [serverMessage, setServerMessage] = useState([]);
    const [isPopUp, setIsPopUp] = useState(false);
    const [playerList, setPlayerList] = useState([]);
    const [deck, setDeck] = useState([]);
    const [myTurn, setMyTurn] = useState(false);
    const [myPoints, setMyPoints] = useState(0);
    const [bonus, setBonus] = useState(["None"]);
    const [state, setState] = useState("roll");
    const [isLimited, setIsLimited] = useState(false)
    const [color, setColor] = useState("");
    const [middleCard, setMiddleCard] = useState("roll");
    const [currentCard, setCurrentCard] = useState("");
    const [nbCards, setNbCards] = useState(0);
    const [test, setTest] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const getCard = (card) => {
        return cartes.indexOf(card);
    }
    const sendMessage = () => {
        alert("message")
    }

    useEffect(() => {

        let mounted = true;
        let failed = false;

        if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected")  == null) {
             navigate("/login-signup"); 
             failed = true;
            }
        if(mounted && !failed){

        socket.emit('join', sessionStorage.getItem('serverConnected'));
        socket.emit("MB-whatMyInfo", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
        socket.emit("MB-whatMyOpponent", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
        socket.emit("MB-nbCard", sessionStorage.getItem("serverConnected"));
        socket.emit("whatTheOrder", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
        socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"))
        }

        return () => {
            mounted = false;
          }
    }, [])


    useEffect(() => {

        let mounted = true;
        let failed = false;

        if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected")  == null) {
             navigate("/login-signup"); 
             failed = true;
            }
        if(mounted && !failed){

        socket.on("getUpdate", () => {
            socket.emit("MB-whatMyOpponent", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
            socket.emit("MB-whatMyState", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
            socket.emit("MB-nbCard", sessionStorage.getItem("serverConnected"));
            socket.emit("whatMyTurn", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
        });
        socket.on("MB-opponent", (oppoList) => {
            setPlayerList(oppoList);
        });
        socket.on('MB-playerInfo', (data) => {
            setDeck(data.deck);
            setMyPoints(data.nbPoints);
            setBonus(data.bonus);
            setState(data.state);
            setIsLimited(data.isLimited)
            setColor(data.color);
        });
        socket.on("chooseVictim", () => {
            setIsPopUp(true);
        });
        socket.on("updateMiddleCard", (data) => {
            setMiddleCard(data.card);
        });
        socket.on("MB-getNbCards", (deckLength) => {
            setNbCards(deckLength);
        });
        socket.on("myTurn", (bool) => {
            setMyTurn(bool);
        });
        socket.on("newState", (newState) => {
            console.log(newState, state)
            setState(newState);
            setTest(newState)
            console.log(test);
            console.log(newState, state)
        });
        socket.on('MB_FIN', (winner) => {

            sessionStorage.setItem('winners', winner);
            navigate("/winner");


        });
        socket.on("attacked", (playerAttacked) => {
            if (playerAttacked === sessionStorage.getItem("name")) {
                setIsVisible(true);
            }
        });

        }
        return () => {
            mounted = false;
            socket.off('getUpdate');
            socket.off('MB-opponent');
            socket.off('MB-playerInfo');
            socket.off('chooseVictim');
            socket.off('updateMiddleCard');
            socket.off('newState');
            socket.off('MB-getNbCards');
            socket.off('myTurn');
            socket.off('MB_FIN');
            socket.off('attacked');
        }
    }, []);


    const Popup = () => {
        useEffect(() => {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3000);

            return () => clearTimeout(timer);
        }, [isVisible]);

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
        socket.emit("MB-playCard", ({ card: card, name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") }))
        socket.emit("MB-whatMyOpponent", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
    }


    const attaqued = (playerAttacked) => {
        let current_player = sessionStorage.getItem("name")
        socket.emit("victim", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected"), playerAttackedName: playerAttacked, card: currentCard });
        socket.emit("MB-whatMyOpponent", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
        setMessages([...messages, `${current_player} attaque le joueur ${playerAttacked} `]);
        setIsPopUp(false);
    }

    const fermerPopup = () => {
        setIsPopUp(false);
        socket.emit("throwCard", ({ card: currentCard, serverId: sessionStorage.getItem("serverConnected") }));
    }

    const leave = () => {
        socket.emit("MB-leaveGame",{ name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected")});
        socket.emit('leave', sessionStorage.getItem('serverConnected'));
        navigate('/');
    }

    //gestion de la toucher entrer pour envoyer un message et de l'animation !! >>>>
    document.addEventListener('DOMContentLoaded', function () {

        let chatContainer = document.getElementById("chatContainer");
        if(chatContainer == null){return 0;}

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

    });

    return (
        <div className='MB-container'>

            {isVisible && <Popup />}

            <div className='MB-adversaire-container-upper-bandeau'>

                <div className='MB-exit-button' onClick={() => leave()}> QUITTER</div>
                <div className='MB-info-button'> INFO</div>

                {playerList.map((player, index) => (
                    <div className={`MB-adversaire-container MB-p${playerList.length == 2 ? "trio" : index + 1}  ${player.myTurn ? "myTurn" : ""}`} key={index}>
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
                        <div className='MB-advers-card-container'>
                            <div className='card'>
                                <img alt='' src={allCard[getCard(player.state)]} className="glow card" />
                            </div>
                            <div className='card'>
                                <img alt='' src={isLimited ? allCard[getCard("limit")] : allCard[getCard("unlimited")] }  className="glow card"></img>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            <div className='middleCard-container'>
                <div className='la-ou-on-pose-les-cartes-tmtc'>
                    <img alt='' src={allCard[getCard(middleCard)]} className="carte-milieu"></img>
                </div>

                <div className='pioche-container'>
                    <div className='pioche'>{nbCards}</div>
                </div>
            </div>


            <div className='MB-card-holder-container'>
                <div className={`me-container ${myTurn ? "myTurn" : ""}`}>
                    <div className='state-container'>
                        <div className={`my-card ${"red"}`}>
                            <div className='MB-player-name'> {sessionStorage.getItem("name")}</div>
                        </div>
                        <div className='card own'>
                            <img alt='' src={allCard[getCard(state)]}  className='card own'></img>
                        </div>
                        <div className='card own'>
                            <img alt='' src={isLimited ? allCard[getCard("limit")] : allCard[getCard("unlimited")]}  className='card own'></img>
                        </div>
                    </div>

                    <div className='info-container'>
                        <div>Nombre de points : {myPoints}</div>
                        <br></br>
                        <div>Bonus : {bonus.join(', ')}</div>
                        <br></br>
                    </div>
                </div>

                <div className='MB-card-holder'>
                    {deck.map((carte) => (
                        <div className="card  player" onClick={() => myTurn ? playCard(carte) : null}>
                            <img alt='' src={allCard[getCard(carte)]} className="player-card"></img>
                        </div>)
                    )}
                </div>

                <div className="chat-container" id='chatContainer'>
                    <div className='message-container MB-message-container' >
                        {messages.map((msg, index) => (
                            <p key={index}>{msg}</p>)
                        )}
                        {serverMessage.map((msg, index) => {
                            <p className="serverText" key={index}> {msg}</p>
                        })}
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


            {isPopUp && (
                <div className='MB-popup-container'>
                    <div className='MB-popup'>
                        {playerList.map((player, index) => (
                            <div className={`adversaire-card-selection ${player.state === "roll" ? player.color : "gris"}`} onClick={() => attaqued(player.name)}>
                                <div className='MB-player-name'>{player.name}</div>
                            </div>
                        ))}
                        <button className='btn-close' onClick={() => fermerPopup()}></button>
                    </div>
                </div>
            )}
        </div>
    )
}


export default MilleBorne;



