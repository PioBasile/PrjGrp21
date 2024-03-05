import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG';
import './CSS/blackJack.css'


const BlackJack = () => {
    const exitButton = require("./CSS/pics/exit.png");
    const user = require("./CSS/svgs/user.svg")
    const betBool = useState(true);
    const piocheBool = useState(false);
    const resterBool = useState(true);
    const doubleBool = useState(true);
    const splitterBool = useState(true);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(["CHAT", "CHAT", "CHAT", "CHAT", "CHAT", "CHAT", "CHAT", "CHAT", "CHAT"]);
    const [serverMessage, setServerMessage] = useState([]);

    const decksSelected = useState([]);

    const as_hearts = require("./CSS/pics/PNG-cards-1.3/ace_of_hearts.png");
    const as_diamonds = require("./CSS/pics/PNG-cards-1.3/ace_of_diamonds.png");

    const handlePioche = () => {

        alert("piocher");
    }

    document.addEventListener('DOMContentLoaded', function () {

        let chatContainer = document.getElementById("chatContainer");

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


    const sendMessage = () => {
        alert("fizjgo")
    }

    const handleDoubler = () => {
        alert("doubler");
    }

    const handleRester = () => {
        alert("rester");
    }

    const handleSplitter = () => {
        alert("splitter");
    }

    const handleBet = () => {
        alert("bet");
    }

    const handleGiveUp = () => {
        alert("give up")
    }

    const handleSelectDeck = (deckNumber) => {

    }

    const CardsHolder = (index) => {
        return (
            <div>

            </div>
        )
    }

    function cardTranslate(symbol) {
        let translatedSymbol;

        switch (symbol) {
            case "Carreau":
                return "clubs";
            case "Pique":
                return "spades";
            case "Coeur":
                return "hearts";
            case "Trefle":
                return "diamonds";
            case "Reine":
                return "queen";
            case "V":
                return "jack";
            case "Roi":
                return "King";
            case "As":
                return "Ace";
            default:
                return symbol;
        }
    }

    function getCardImage(card) {
        const cardImagesFolder = "./CSS/PNG-cards-1.3/";
        const translateSymbol = cardTranslate(card.symbole);
        return `${cardImagesFolder}${card.number}_of_${translateSymbol}.png`;
    }



    return (
        <div className='black-jack-container'>
            <div className='upper-bandeau'>
                <div className='leave-game-bj'>
                    <img src={exitButton} className='leave-game-bj'></img>
                </div>

                <div className='wallet-container'>
                    <div className='wallet'>$14.18</div>
                </div>
                <div></div>
            </div>

            <div className='dealerCard-container'>
                DEALER (10)
                <div className='dealerCard'>
                    {[...Array(5)].map((key, index) => (
                        <div className='card'>
                            <img src={as_diamonds} className="card"></img>
                        </div>
                    ))}
                </div>
            </div>

            <div className='blackJackCard-container'>
                {/* remplacer le .map par la liste des decks */}
                {[...Array(5)].map((key, index) => (
                    <div index={index} className='cardHolder-bj '>


                        <div className={`deck-bj `}>

                            {/* remplacer le .map par la liste des cartes du joueurs */}
                            {[...Array(7)].map((key, index) => (
                                <div className={`card card${index + 1}`}>
                                    <img src={as_diamonds} className={"card"}></img>
                                </div>


                            ))}
                        </div>

                        <div className={`deck-bj deck2`}>

                            {/* remplacer le .map par la liste correspondant aux cartes apres un split */}
                            {[...Array(7)].map((key, index) => (
                                <div>
                                    <div className={`card card${index + 1}`}>
                                        <img src={as_diamonds} className={"card"}></img>
                                    </div>

                                </div>
                            ))}
                        </div>
                        {/* mettre le userName ici avec ses points */}
                        <div className='userName'></div>
                    </div>
                ))}

            </div>
            <div className='action-container'>
                <div className='bet-action-container'>
                    <div>
                        <div className='action-button-bj' onClick={piocheBool ? handlePioche : null}>Piocher</div>
                        <div className='action-button-bj' onClick={resterBool ? handleRester : null} >Rester</div>
                    </div>
                    <div >
                        <div className='action-button-bj' onClick={doubleBool ? handleDoubler : null}>Doubler</div>
                        <div className='action-button-bj' onClick={splitterBool ? handleSplitter : null}>Splitter</div>
                    </div>
                </div>
                <div className='bet-container'>
                    <div className='inputBet-container'>
                        <input type="text" className='input bj'></input>
                        <div className='changeBetValue'>
                            <div className='divise2'>1/2</div>
                            <div className='slash'>|</div>
                            <div className='times2'>2x</div>
                        </div>
                    </div>

                    <div className='bet-giveup-container'>
                        <div className='bet-button-bj' onClick={betBool ? handleBet : null} >BET</div>
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