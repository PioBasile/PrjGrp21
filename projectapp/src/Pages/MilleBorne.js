import React, { useState, useEffect } from 'react';
import socket from '../socketG';
import { useNavigate } from 'react-router-dom';
import './CSS/MilleBorne.css'


const MilleBorne = () => {


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
    const getCard = (card) => {
        return cartes.indexOf(card);
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

            socket.emit('join', sessionStorage.getItem('serverConnected'));
            socket.emit("MB-whatMyInfo", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
            socket.emit("MB-whatMyOpponent", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
            socket.emit("MB-nbCard", sessionStorage.getItem("serverConnected"));
            socket.emit("whatTheOrder", { name: sessionStorage.getItem("name"), serverId: sessionStorage.getItem("serverConnected") });
            socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"));
            socket.emit("loadTheChat", sessionStorage.getItem("serverConnected"));
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
                console.log(isLimited)
                //setColor(data.color);
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
                setState(newState);
                setTest(newState)
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

            socket.on("getMessage", (msgList) => {

                setMessages(msgList);
            })


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
            socket.off('MB-getMessage');
        }
    }, [navigate,state,test,isLimited]);


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


    return (
        <div className='MB-container'>

            {isSave && (
                <div className='savePopUp'>
                    <h1 className='titlePopUp'> Entrer le nom de la save : </h1>
                    <input className="inputPopup" type="text" placeholder='save Name' onChange={(e) => setSaveName(e.target.value)}></input>
                    <div className="saveButtonPopUp" onClick={() => saveGame()}>SAVE</div>
                </div>
            )}

            {isVisible && <Popup />}

            <YourComponent></YourComponent>

            <div className='MB-adversaire-container-upper-bandeau'>

                <div className='MB-exit-button' onClick={() => leave()}> QUITTER</div>
                <br></br>
                <p></p>
                <div></div>
                <div className='' onClick={() => saveGame()}> SAVE</div>
                
                
                <div className='MB-info-button' onClick={toggleInfo}>INFO</div>
                    {showInfo && (
                        <div className='MB-info-content'>
                        <p> 
                            <strong>Mille Borne</strong> <br /> <br />
                            <strong> Description</strong> 
                            <p>
                                Le jeu comprend 106 cartes. Les joueurs doivent accumuler des bornes. Il faut aller jusqu'à 1 000 bornes exactement pour que la partie se termine. Le jeu comporte donc des cartes représentant :
                                les distances parcourues ;
                                les attaques, c'est-à-dire des aléas de la route (accidents, crevaisons, pannes...), et la signalisation routière (limitation de vitesse, feux) qui permettent de freiner ou stopper son adversaire ;
                                les parades, qui permettent de contrer l'effet des attaques ;
                                les bottes, qui sont des protections contre une attaque spécifique, au nombre de quatre.
                                La liberté du joueur est surtout dans la décision d'appliquer des obstacles à l'adversaire avec le risque, si celui-ci possède la protection spéciale, qu'il marque 300 points supplémentaires comme « coup fourré ». 
                                Bien sûr, ce risque augmente au cours du jeu au fur et à mesure que plus de cartes sont piochées.
                                Le jeu se joue sur table, avec une pioche et une défausse centrale. 
                                Chaque joueur a devant lui ces cartes de distance, visible de tous, ainsi que sa 
                                pile de jeu, sur laquelle sont empilées au fur et à mesure les cartes d'attaque et de 
                                parade. Chaque joueur doit commencer par poser un feu vert pour pouvoir rouler et poser 
                                des cartes de distance. A son tour, un joueur joue une carte (ou en défausse une, s'il ne 
                                peut rien jouer), puis en re-pioche une, de manière à toujours en avoir 6 en main. 
                                Les kilomètres, parades et bottes sont jouées pour soi, les attaques sont jouées chez les adversaires pour les ralentir 
                                voire les arrêter.
                            </p> <br /> <br /> <br />

                            <strong> Attaque </strong>
                            <p>
                                Il y a cinq attaques différentes : l'accident, la crevaison, la panne d'essence, la limite de vitesse et le feu rouge.
                                L'accident, la crevaison et la panne d'essence immobilisent le véhicule : le joueur à qui on pose une de ces attaques ne peut plus poser aucune carte étape. 
                                Pour redémarrer, le joueur doit jouer la parade correspondant
                                à l'attaque, puis jouer un feu vert pour repartir et pouvoir recommencer à rouler.
                                Le feu rouge empêche également de continuer à avancer (on ne peut plus poser de cartes étapes), mais il se pare simplement avec un feu vert.
                                La limite de vitesse est une attaque qui peut se superposer aux autres. Elle n'empêche pas d'avancer, mais elle oblige le joueur à ne poser que des cartes de 25 ou 50km, ce qui ralentit beaucoup le jeu. 
                                On peut avoir une limitation de vitesse même en étant à l'arrêt. Elle se pare simplement avec une fin de limite de vitesse.
                            </p> <br /> <br /> <br />

                            <strong> Parade </strong>
                            <p>
                                Il y a cinq parades différentes, qui correspondent chacune à une attaque (respectivement) : les réparations, l'essence, la roue de secours, la fin de limite de vitesse et le feu vert.
                                Ces cartes sont les plus utiles à conserver en main, afin de pouvoir parer rapidement une attaque et repartir. On ne peut jouer la parade que sur l'attaque qui lui correspond, et en réponse
                                à cette attaque (on ne peut pas se prémunir d'un éventuel accident en jouant une réparation en avance).
                                Le feu vert est la carte la plus disponible (14 exemplaires) et la plus importante du jeu. En effet, non seulement les joueurs doivent en jouer un au début de la partie pour commencer à rouler, 
                                mais ils doivent aussi en jouer un après une réparation, une essence ou une roue de secours pour pouvoir repartir
                            </p> <br /> <br /> <br />

                            <strong> Botte </strong>
                            <p> Les bottes sont des cartes spéciales, qui permettent de se prémunir contre un type d'attaque. Lors qu'un joueur a une botte devant lui, il est impossible de lui mettre l'attaque parée par cette botte. 
                                Cette carte est permanente, et un joueur peut avoir plusieurs bottes.
                                <ul>L'as du volant ne peut pas avoir d'accident. </ul>
                                <ul>Le camion-citerne ne peut pas tomber en panne d'essence. </ul>
                                <ul>L'increvable ne peut pas crever. </ul>
                                <ul>Le véhicule prioritaire ne peut pas avoir de limite de vitesse ou de feu rouge. Par ailleurs, le véhicule prioritaire n'a pas besoin de feu vert pour redémarrer après un accident, une panne ou une crevaison,
                                    ni en début de partie avant de poser sa première borne. </ul>
                                Il est possible de jouer une botte dès qu'on l'a en main, pour s'éviter des attaques futures. Mais il est aussi possible de la conserver en main. Dans ce cas, au moment où le joueur se fait attaquer par une carte 
                                qu'il peut botter (on lui met une crevaison alors qu'il a l'increvable en main, par ex.), il s'agit d'un « coup fourré »
                                (qui vaut 300 points). Le joueur attaqué annonce le coup fourré à haute voix et joue immédiatement sa botte. L'attaque jouée est défaussée, le joueur venant de faire le coup fourré pioche une carte. 
                                Le joueur ayant posé l'attaque termine son tour et pioche sa carte, et c'est au tour du joueur suivant, dans l'ordre normal de jeu.
                            </p>
                        </p>
                        </div>
                    )}
                

                {playerList.map((player, index) => (
                    <div className={`MB-adversaire-container MB-p${playerList.length === 2 ? "trio" : index + 1}  ${player.myTurn ? "myTurn" : ""}`} key={index}>
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
                                <img alt='' src={player.isLimited ? allCard[getCard("limit")] : allCard[getCard("unlimited")]} className="glow card"></img>
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
                            <img alt='' src={allCard[getCard(state)]} className='card own'></img>
                        </div>
                        <div className='card own'>
                            <img alt='' src={isLimited ? allCard[getCard("limit")] : allCard[getCard("unlimited")]} className='card own'></img>
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
                        <div className="player-card" onClick={() => myTurn ? playCard(carte) : null}>
                            <img alt='' src={allCard[getCard(carte)]} className="player-card"></img>
                        </div>)
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


            {isPopUp && (
                <div className='MB-popup-container'>
                    <div className='MB-popup'>
                        {playerList.map((player, _) => (
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



