import React, { useState, useEffect } from 'react';
import { ScrollRestoration, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import socket from '../socketG';
import './CSS/blackJack.css'




const BlackJack = () => {
    const navigate = useNavigate();
    const SERVER_ID = sessionStorage.getItem("serverConnected");
    const NAME = sessionStorage.getItem("name");
    const MY_DECK = NAME;
    const exitButton = require("./CSS/pics/exit.png");
    const user = require("./CSS/svgs/user.svg")
    const betBool = useState(true);
    const [allDecks, setAllDeck] = useState([]);
    const [money, setMoney] = useState(0);
    const [dealerDeck, setDealerDeck] = useState([]);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [serverMessage, setServerMessage] = useState([])
    const [firstPart, setFirstPart] = useState(true);
    const [myTurn, setMyTurn] = useState(false);
    const [canBet, setCanBet] = useState(true);
    const [betAmount, setBetAmount] = useState(0);
    const [hasSplitted, setSplitted] = useState(false);
    const [moneyWin, setMoneyWin] = useState(null);
    const [whoWon, setWhoWon] = useState("");


    // par default le deck selectionner est le tient logique
    const [deckSelected, setDeckSelected] = useState(NAME);

    const backCardsImageTest = require("./CSS/pics/PNG-cards-1.3/blue.png")


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
    function calculPoints(cartes) {
        let points = 0;
        let nombreAs = 0;

        for (let carte of cartes) {
            if (carte.power >= 11 && carte.power <= 13) {
                points += 10;
            }
            else if (carte.power === 14) {
                points += 11;
                nombreAs++;
            }
            else {
                points += carte.power;
            }
        }

        while (nombreAs > 0 && points > 21) {
            points -= 10;
            nombreAs--;
        }

        return points;
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
        }, [message]);

        return (
            <div></div>
        );
    }

    const handlePioche = () => {
        socket.emit("hit", sessionStorage.getItem("serverConnected"), MY_DECK);
    }

    const sendMessage = () => {
        socket.emit('sendMessage', { name:NAME, msg: message, serverId: SERVER_ID });
        setMessage('');
    }

    const handleDoubler = () => {
        socket.emit("double", SERVER_ID, MY_DECK)
    }

    const handleRester = () => {
        setMyTurn(false)
        socket.emit("stay", SERVER_ID, MY_DECK);
    }

    const handleSplitter = () => {
        socket.emit("split", SERVER_ID, MY_DECK);
    }

    const handleBet = () => {
        if (betAmount < 2 || betAmount > money) {
            alert("pas assez d'argent mon sauce")
        }
        else {
            socket.emit("BJ-bet", SERVER_ID, deckSelected, parseInt(betAmount), NAME);
        }
    }

    const handleGiveUp = () => {
        navigate("/BrowserManager")
        socket.emit("leave",)
    }

    const handleSelectDeck = (deckName) => {
        setDeckSelected(deckName);
    }

    const divide = () => {
        let montant = Math.floor(betAmount / 2);
        setBetAmount(montant)
    }

    const timesTwo = () => {
        let montant = betAmount * 2;
        setBetAmount(montant)
    }


    const handleAllIn = () => {
        socket.emit("BJ-bet", SERVER_ID, deckSelected, parseInt(money), NAME);
    }


    useEffect(() => {

        let mounted = true;
        let failed = false;

        if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected") == null) {
            navigate("/login-signup");
            failed = true;
        }
        if (mounted && !failed) {
            socket.emit('join', SERVER_ID);


            socket.emit("BJ-allDeckInfo", SERVER_ID);


            socket.emit("BJ-whatMyMoney", NAME);
            socket.emit("whatDealerCards", SERVER_ID);
            socket.emit("BJ-whatMyTurn", SERVER_ID, NAME);
            socket.emit("whatsStatus", SERVER_ID)
            socket.emit("loadTheChat", SERVER_ID)
        }

        return () => {
            mounted = false;
        }
    }, [navigate])

    function loop(i, card, callback) {
        setTimeout(function () {
            setDealerDeck(prevDealerDeck => [...prevDealerDeck, card]);
            callback();
        }, "2000" * i);
    }


    useEffect(() => {
        let mounted = true;
        let failed = false;

        if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected") == null) {
            navigate("/login-signup");
            failed = true;
        }
        if (mounted && !failed) {
            socket.on("yourMoney", (myMoney) => {
                setMoney(myMoney);
            })

            socket.on("allDeck", (deckInfo) => {
                console.log(deckInfo);
                setAllDeck(deckInfo);
            })

            socket.on("dealerCards", (dealerCards) => {
                if (dealerCards.length > 1) {
                    let i = 1
                    let promises = [];
                    while (i < dealerCards.length) {
                        promises.push(new Promise(resolve => {
                            loop(i, dealerCards[i], resolve)
                        }));
                        i++
                    }

                    Promise.all(promises).then(() => {
                        setTimeout(() => {
                            socket.emit("resolveMoney", SERVER_ID);
                        }, "2000")
                    });

                } else {
                    setDealerDeck(dealerCards);
                }
            });


            socket.on("BJ-myTurn", (bool) => {

                setMyTurn(bool);
            })

            socket.on("gameStatus", (part) => {
                //bet or action

                if (part === "bet") {
                    setMyTurn(false);
                    setCanBet(true);
                }

                else if (part === "action") {
                    setCanBet(false);
                }

            })

            socket.on("BJ-askMyTurn", () => {
                socket.emit("BJ-whatMyTurn", SERVER_ID, NAME);
            })

            socket.on("splitted", () => {
                setSplitted(true)
            })

            socket.on("askMoney", () => {
                socket.emit("BJ-whatMyMoney", NAME);
            })

            socket.on("moneyWin", (money,who_won) => {
                setMoneyWin(money);
                setWhoWon(who_won);
            })

            socket.on("getMessage", (msgList) => {
                setMessages(msgList);
            });

        }
        return () => {
            mounted = false;
            socket.off("yourMoney");
            socket.off("allDeck");
            socket.off("dealerCards");
            socket.off("gameSatus");
            socket.off("BJ-askMyTurn");
            socket.off("splitted")
            socket.off("askMoney")
            socket.off("getMessage")
            socket.off("moneyWin")
        }
    })
    
    useEffect(() => {
        const messageContainer = document.querySelector('.message-container');
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }, [messages]);


    return (
        <div className='black-jack-container'>
            <YourComponent></YourComponent>
            <div className='upper-bandeau'>


                <div className='wallet-container'>
                    <div className='wallet'>${money}</div>
                </div>
                <div>{NAME}</div>
            </div>

            <div className={`dealerCard-container `}>
                DEALER ({!canBet ? calculPoints(dealerDeck) : "?"})
                <div className={`dealerCard`}>
                    {dealerDeck.map((card, index) => (
                        <div className='card'>
                            <img src={!canBet ? getCardImage(card) : backCardsImageTest} className={"card"}></img>
                        </div>
                    ))}
                </div>
            </div>

            <div className='blackJackCard-container'>
                {/* remplacer le .map par la liste des decks */}
                {allDecks.map((player, index) => (
                    <div onClick={() => handleSelectDeck(player.name)} index={index} className={`cardHolder-bj ${player.myTurn ? "myTurn" : ""} `} >

                        <div> {player.name} ({!canBet ? calculPoints(player.deck) : "?"})</div>
                        {player.splittedDeck.length > 0 && <div> {player.name} ({!canBet ? calculPoints(player.splittedDeck) : "?"})</div>}

                        <div className={`deck-bj `}>

                            {/* remplacer le .map par la liste des cartes du joueurs */}
                            {player.deck.map((card, index) => (
                                <div className={`card card${index + 1}`}>
                                    <img src={!canBet ? getCardImage(card) : backCardsImageTest} className={"card"}></img>
                                </div>


                            ))}
                        </div>

                        <div className={`deck-bj deck2`}>
                            {/* remplacer le .map par la liste correspondant aux cartes apres un split */}
                            {player.splittedDeck.map((card, index) => (
                                <div>
                                    <div className={`card card${index + 1}`}>
                                        <img src={getCardImage(card)} className={"card"}></img>
                                    </div>

                                </div>
                            ))}
                        </div>
                        {/* mettre le userName ici avec ses points */}
                        <div className='userName'></div>
                        {player.bets.map((bet, index) => (
                            <div key={index}>
                                <p>{bet.name} : {bet.amountBet}$</p>
                            </div>
                        ))}

                    </div>
                ))}

            </div>
            <div className={`action-container ${myTurn ? "myTurn" : ""} `}>
                <div className='bet-action-container'>
                    <div>
                        <div className='action-button-bj' onClick={myTurn && !canBet ? handlePioche : null}>Piocher</div>
                        <div className='action-button-bj' onClick={myTurn && !canBet ? handleRester : null} >Rester</div>
                    </div>
                    <div >
                        <div className='action-button-bj' onClick={myTurn && !canBet ? handleDoubler : null}>Doubler</div>
                        <div className='action-button-bj' onClick={myTurn && !canBet ? handleSplitter : null}>Splitter</div>
                    </div>
                </div>
                <div className='bet-container'>
                    <div className='inputBet-container'>
                        <input type="text" className='input bj' value={betAmount} onChange={(e) => { setBetAmount(e.target.value); }}></input>
                        <div className='changeBetValue'>
                            <div className='divise2' onClick={() => divide()}>1/2</div>
                            <div className='slash'>|</div>
                            <div className='times2' onClick={() => timesTwo()}>2x</div>
                        </div>
                    </div>

                    <div className='bet-giveup-container'>
                        <div className='bet-button-bj' onClick={canBet ? handleBet : null} >BET</div>
                        <div className='bet-button-bj' onClick={canBet ? handleAllIn : null} >ALL-IN</div>
                        <div className='giveup-button-bj' onClick={handleGiveUp}>ABANDONNER</div>
                    </div>
                </div>
            </div>
            

            <div className="chat-container" id='chatContainer'>
                <div className='message-container' >
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
                    // onFocus={changeOpacity}
                    />
                </div>

            </div>
        </div>
    )
}

export default BlackJack