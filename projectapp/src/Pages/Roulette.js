import React, { useState, useEffect,useRef } from 'react';
import socket from '../socketG';
import './CSS/roulette.css';
import { useNavigate } from 'react-router-dom';
import music from './CSS/sounds/music.mp3';


const Roulette = () => { 
    const navigate = useNavigate();
    const [timer, setTimer] = useState(-1);
    const coin = require('./CSS/pics/coin.webp')
    const [isSpinning, setIsSpinning] = useState(false);
    const [afficherPopup, setAfficherPopup] = useState(false);
    const [money, setMoney] = useState(0);
    const [montant, setMontant] = useState(0); // Initialiser 
    const rouletteEuropeenne = {
        numeros12: Array.from({ length: 12 }, (_, index) => index * 3 + 1), // Numéros individuels de 0 à 36
        numeros24: Array.from({ length: 12 }, (_, index) => index * 3 + 2), // Numéros individuels de 0 à 36
        numeros36: Array.from({ length: 12 }, (_, index) => index * 3 + 3), // Numéros individuels de 0 à 36
        casesPariExterieur: ['1to18', 'EVEN', 'RED', 'BLACK', 'ODD', '19to36',],
        douzaines: ['first twelve', 'sec twelve', 'thd twelve'],
    };
    const [result, setResult] = useState(null);
    const [valueBet, setValueBet] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [moneyWin, setMoneyWin] = useState(0);
    //EMPLACEMENT DU JETON EN COURS DE PARIS
    const [currentValeur, setCurrentValeur] = useState(null);
    const roulette = require("./CSS/pics/roulette.jpg");
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);



    const fermerPopup = () => {
        setAfficherPopup(false);
    };

    useEffect(() => {
        audioRef.current = new Audio(music);
    
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0; 
            }
        };
    }, [music]); 

    const playM = () => {
        if (!audioRef.current) return;
    
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch((e) => console.error("Erreur lors de la lecture de l'audio:", e));
        }
    
        setIsPlaying(!isPlaying); 
    };



    const handleBet = (valeur) => {

        if (valeur === "first twelve") {
            valeur = 37
        }
        if (valeur === "sec twelve") {
            valeur = 38
        }
        if (valeur === "thd twelve") {
            valeur = 39
        }
        if (valeur === "EVEN") {
            valeur = 40
        }
        if (valeur === "ODD") {
            valeur = 41
        }
        if (valeur === "RED") {
            valeur = 42
        }
        if (valeur === "BLACK") {
            valeur = 43
        }
        if (valeur === "1to18") {
            valeur = 44
        }
        if (valeur === "19to36") {
            valeur = 45
        }
        setCurrentValeur(valeur);
        setAfficherPopup(true);


    }

    const handleSpin = (randomResult) => {
        setResult(randomResult);

        if (sessionStorage.getItem("location") === "/roulette") {

            let randomDeg = getPositionInRoulette(randomResult) + 1080

            var spinningElem = document.getElementById('spinning');

            spinningElem.style.transform = 'rotate(' + randomDeg + 'deg';
        }
        // setMoneyWin(0);
        setIsSpinning(true);
    }

    function convertBetValues(betValues) {
        const conversionRules = {
            37: 'first twelve',
            38: 'sec twelve',
            39: 'thd twelve',
            40: 'EVEN',
            41: 'ODD',
            43: 'RED',
            42: 'BLACK',
            44: '1to18',
            45: '19to36'
        };

        return betValues.map(value => {
            return conversionRules[value] || value;
        });
    }



    const handleSubmit = () => {


        if (montant > 0) {
            console.log(sessionStorage.getItem('name'), montant, currentValeur);
            socket.emit("bet", sessionStorage.getItem('name'), montant, currentValeur);
            fermerPopup();
        }
        else {
            alert("PLEASE MONEY > 0");
        }
    };

    const getPositionInRoulette = (number) => {
        const orderInRoulette = {
            26: 10, 3: 20, 35: 30, 12: 40, 28: 50, 7: 58, 29: 68, 18: 78, 22: 88, 9: 98, 31: 106, 14: 116, 20: 126, 1: 136, 33: 146, 16: 154, 24: 164, 5: 174, 10: 184, 23: 194, 8: 204, 30: 212, 11: 222, 36: 232, 13: 242, 27: 252, 6: 260, 34: 270, 17: 280, 25: 290, 2: 300, 21: 312, 4: 322, 19: 332, 15: 342, 32: 352, 0: 360
        };

        return (orderInRoulette[number]);
    }

    const leave = () => {
        socket.emit("leave");
        navigate('/BrowserManager');
    }



    const sendMessage = () => {
        socket.emit('rlt-sendMessage', { name: sessionStorage.getItem("name"), msg: message });
        setMessage('');
    }

    useEffect(() => {

        // GESTION stabilité de la connection
        socket.emit("rouletteConnection");
        socket.emit("getServ");
        socket.emit("ArgentViteBatard", sessionStorage.getItem('name'));
        socket.emit("rlt-loadTheChat", sessionStorage.getItem("serverConnected"))
    }, [])


    useEffect(() => {
        let mounted = true;
        if (mounted) {

            socket.on("bets", (betList) => {
                let bets = betList.map(bet => bet.betPos);
                setValueBet(convertBetValues(bets));
                console.log(valueBet);
            })



            socket.on('spinwheel', (resy) => {
                if (sessionStorage.getItem("location") === "/roulette") {

                    handleSpin(resy);
                }
            });

            socket.on("tropsTard", () => {

                alert("trops tard");

            });

            socket.on("rouletteTimer", (time) => {

                setTimer(time);

            });

            socket.on("VoilaTesSousMonSauce", (argent) => {
                setMoney(argent);
            });

            socket.on("listWins", (wins) => {

                let sumWins = 0;
                wins.forEach((win) => {

                    if (win["name"] === sessionStorage.getItem('name')) {

                        sumWins += win["won"];

                    }

                });

                setMoneyWin(sumWins);

            });

            if (sessionStorage.getItem("name") == null) { navigate("/login-signup"); }


            socket.on("rlt-getMessage", (msgList) => {

                setMessages(msgList);
            })

        }
        return () => {
            mounted = false;
            socket.off("rlt-getMessage")
            socket.off("listWins")
            socket.off("VoilaTesSousMonSauce")
            socket.off("rouletteTimer")
            socket.off("tropsTard")
            socket.off("spinwheel")
            socket.off("bets")
        }


    }, [])


    const resultRoulette = () => {

        setIsSpinning(false);
        setIsVisible(true);
        setValueBet([])
        setTimeout(() => {
            setIsVisible(false);
            socket.emit("ArgentViteBatard", sessionStorage.getItem('name'));
        }, 3000);

    }

    const Popup = () => {

        return (

            <div>
                <div className={`popup ${isVisible ? 'visible' : ''} `}>
                    <p>The number is {result} YOU WIN {moneyWin} $ </p>
                </div>

            </div>
        );
    };

    const isRed = (result) => {
        return result === 1 || result === 3 || result === 5 || result === 7 || result === 9 || result === 12 || result === 14 || result === 16 || result === 18 || result === 19 || result === 21 || result === 23 || result === 25 || result === 27 || result === 30 || result === 32 || result === 34 || result === 36
    }


    //permet de recuperer l'élement cliqué et de savoir si oui ou non on est en train d'écrire dans le chat ou faire d'autres actions sur le jeu {



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

                try{

                    
                document.removeEventListener('click', getElementId);
                document.getElementById("inputChat").removeEventListener('keydown', sendMessageOnEnter);

                } catch {
                    console.log("meh");
                }

            };
        }, [message]);

        return (
            <div></div>
        );
    }

    useEffect(() => {
        const messageContainer = document.querySelector('.message-container');
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }, [messages]);


    return (

        <div className='roulette'>
            <button className='rou-timer'> vous avez encore {timer}s pour bet </button>

            <YourComponent></YourComponent>
            <button className='rou-music' onClick={playM}> {isPlaying ? "Pause Music" : "Play Music"}</button>

            <div className="ro-bye-button" onClick={leave}> Leave </div>


            <div className='rouletteGameContainer' >
                {!isSpinning && (<Popup />)}
                <div className='rouletteContainer' >

                    <div className='vertical-line'></div>
                    <div onAnimationEnd={resultRoulette} className={isSpinning ? "spinning" : 'notSpinning'}>
                        <img alt='d' src={roulette} id="spinning" className={isSpinning ? "spinning" : 'notSpinning'}></img>
                    </div>

                </div>

                <div className='bigPlateauContainer'>
                    <div onClick={() => money > 0 ? handleBet(0) : null} className='numberZero'> {(valueBet.includes(0)) ? <img alt="d" src={coin} className="coin"></img> : 0} </div>
                    <div className='plateauContainer'>


                        <div className='numberContainer '>

                            {rouletteEuropeenne.casesPariExterieur.map((valeur, index) => (
                                <div onClick={() => money > 0 ? handleBet(valeur) : null} className='exterior ' key={index}>
                                    {(valueBet.includes(valeur)) ? <img alt='' src={coin} className="coin"></img> : valeur}
                                </div>
                            ))}
                        </div>

                        <div className='numberContainer'>
                            {rouletteEuropeenne.douzaines.map((valeur, index) => (
                                <div onClick={() => money > 0 ? handleBet(valeur) : null} className='douzaine' key={index}>
                                    {(valueBet.includes(valeur)) ? <img alt='coin' src={coin} className="coin"></img> : valeur}
                                </div>
                            ))}
                        </div>




                        <div className='numberContainer'>
                            {rouletteEuropeenne.numeros12.map((valeur, index) => (
                                <div onClick={() => money > 0 ? handleBet(valeur) : null} className={`oneTo36Number ${isRed(valeur) ? '' : 'black'}`} key={index}>
                                    {(valueBet.includes(valeur)) ? <img alt='s' src={coin} className="coin"></img> : valeur}
                                </div>

                            ))}
                        </div>

                        <div className='numberContainer'>
                            {rouletteEuropeenne.numeros24.map((valeur, index) => (
                                <div onClick={() => money > 0 ? handleBet(valeur) : null} className={`oneTo36Number ${isRed(valeur) ? '' : 'black'}`} key={index}>
                                    {(valueBet.includes(valeur)) ? <img alt='' src={coin} className="coin"></img> : valeur}
                                </div>

                            ))}
                        </div>

                        <div className='numberContainer'>
                            {rouletteEuropeenne.numeros36.map((valeur, index) => (
                                <div onClick={() => money > 0 ? handleBet(valeur) : null} className={`oneTo36Number ${isRed(valeur) ? '' : 'black'}`} key={index}>
                                    {(valueBet.includes(valeur)) ? <img alt='' src={coin} className="coin"></img> : valeur}
                                </div>

                            ))}
                            {afficherPopup && (<div className='moneyBet'>
                                <div className="popupContainer">
                                    <div className="contenu-popup">

                                        <h2>Montant du paris ! </h2>
                                        <label>
                                            <input type="number" className='inputMoney' value={montant} onChange={(e) => setMontant(e.target.value)} />
                                        </label>
                                        <button className='button' onClick={handleSubmit}>BET</button>
                                        <button className='btn-close' onClick={fermerPopup}>X</button>
                                    </div>
                                </div>
                            </div>)}

                        </div>
                    </div>
                </div>

                <div className='moneyContainer'>
                    {money} $
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

export default Roulette;
