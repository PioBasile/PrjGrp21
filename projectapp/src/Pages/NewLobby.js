import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/newLobby.css';
import socket from '../socketG';

const NewLobby = () => {

    

    socket.emit('join', sessionStorage.getItem('serverConnected'));
    sessionStorage.setItem('loaded', false);

    const [playerList, setPlayerList] = useState([]);

    const [owner, setOwner] = useState("");
    const [maxPlayers, setMaxPlayers] = useState(0);
    const [gameName, setGameName] = useState("")
    const [gameType, setGameType] = useState("")
    const [password, setPassword] = useState("")
    const [moneyBet, setMoneyBet] = useState(0);
    const [timer, setTimer] = useState(0)
    const [isReady, setIsReady] = useState(false);
    const [quoteOfTheDay, setQuoteOfTheDay] = useState("");

    const [allReady, setAllReady] = useState(false)
    const [timeBetweenTurn, setTimeBetweenTurn] = useState(30);
    const [roundsMax, setRoundsMax] = useState(20);
    const navigate = useNavigate();
    const [clobby, setLobby] = useState({ playerList: [] });
    const [bots , setBots] = useState(
        [
            {imageUrl: require("./CSS/pics/mathis.webp"),id: "Mathis", level : 1,                   geoDash:require("./CSS/pics/Easy.webp")},
            {imageUrl: require("./CSS/pics/michael-jackson.jpg"),id: "Micheal Jackson", level : 20, geoDash:require("./CSS/pics/Normal.webp")},
            {imageUrl: require("./CSS/pics/trump (1).jpg"),id: "Donald Trump", level : 530,         geoDash:require("./CSS/pics/Harder.webp")},
            {imageUrl: require("./CSS/pics/coin.webp") ,id: "Chill Luigi", level : 1069,            geoDash:require("./CSS/pics/Insane.webp")},
            {imageUrl: require("./CSS/pics/biden (1).jpg"), id: "Joe Biden", level : 9999,          geoDash:require("./CSS/pics/ExtremeDemon.webp")},
        ]
    );
    const [showBots, setShowBots] = useState(false);


    const quotes = [
        "At the end of the day, it's the friends we made along the way",
        "Gambling is not an addiction ~ Obama (maybe)",
        //"If a girl leaves you for another there is always her mother",
        "I'd rather have 1 medkit thant 10 bandages",
        "We will never ask for your Credit Card information",
        "Liberté, égalité, Renault Coupé",
        //"If she say your a looser you shall pick up her mother",
        "Pro Tips 1 : Always All-in ",
        "Pro Tips 2 : Don't forget to breath",
        "Pro Tips 3 : Don't loose",
        "Pro Tips 4 : We don't play to play we play to Win",
        "Pro Tips 5 : Don't stay in storm",
        "Pro Tips 6 : It's never about size",
        "Pro Tips 7 : SAM-SAM le plus petit des grands héros",
        "Pro Tips 8 : OUI-OUI est un garçon ?",
        "Pro Tips 9 : Oh la qui voit la inspecteur gadget",
        "Pro Tips 10 : Si tu perds Thomas Le Train te suivras !",
        "Pro Tips 11 : always go all in on black",
        "Pro Tips 12 : never trust a fart",
        "Send you credit card info to this number : 0658073801",
        "Pickachu will always choose you ",
        "This is pay to win",
        "Always emote when your friend loose",
        "Don't forget to drink water",
        "FREE V-BUCKS",
        "Never back down never what ??",
        "NEVER GIVE UP !",
        "NEVER SURRENDER",
        "Maurice La Malice",
        "OUI OUI BAGUETTE",
        "Reality is an illusion, the universe is a hologram, buy gold, bye!",
        "Pro Tips 13: In case of fire, git commit, git push, then leave building",
        "Pro Tips 14: Remember, the snooze button is a trap",
        "Pro Tips 15 : Remember, it’s only a game, until you win.",
        "Si la vie te donne des citrons, fais-en une tarte. Tout le monde aime la tarte.",
        "L’argent ne fait pas le bonheur, mais il est plus confortable de pleurer dans une Mercedes que sur un vélo.",
        "L’alcool tue lentement. On s’en fout. On n’est pas pressés.",
        "L'alcool tue, pas le gambling, va au casino.",
        "Pro Tip 16 : La patience est une vertu... surtout quand ton Wi-Fi est lent.",
    ];

    const generateQuote = () => {
        let randomId = Math.round(Math.random() * quotes.length);
        let randomQuote = quotes[randomId]
        return randomQuote;
    }


    useEffect(() => {

        const theQuote = generateQuote();
        setQuoteOfTheDay(theQuote);
        
    }, []);
    // --------------------------------- FUNCTIONS -----------------------------------

    function leaveGame() {
        socket.emit('leaveGame', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
        socket.emit('leave', sessionStorage.getItem('serverConnected'));
        navigate('/BrowserManager');
    };



    const handleKickPlayer = (index) => {
        socket.emit('deco_lobby', sessionStorage.getItem('serverConnected'), playerList[index].username);
    };

    const handleReadyClick = () => {
        if (isReady) setIsReady(false);
        else setIsReady(true)
        socket.emit('ready', sessionStorage.getItem('serverConnected'), sessionStorage.getItem('name'));
    };

    const handleStart = () => {

        let count = 0;
        clobby.playerList.forEach(player => {
            if (player.isReady) { count++; }
        });

        if (count === clobby.nbPlayerMax && clobby.owner === sessionStorage.getItem('name')) {
            setAllReady(true)
            socket.emit("dealeteThieGameBozo", sessionStorage.getItem('serverConnected'));
            setTimeout(() => {
                socket.emit("StartGame", sessionStorage.getItem('serverConnected'));
            }, "3000")
        };
    }

    useEffect(() => {

        if (sessionStorage.getItem('serverConnected') === "-1") {
            navigate("/BrowserManager");
        }

        socket.emit("getServ");
        socket.emit("lobbyInfo_UwU", sessionStorage.getItem('serverConnected'))

    }, [navigate])


    useEffect(() => {

        let mounted = true;
        if (mounted) {

            socket.on("yourInfoBebs", (data) => {

                console.log("test");

                switch (data.gameType) {
                    case "mb":
                        setGameType("Mille Bornes");
                        break
                    case "rd":
                        setGameType("Random");
                        break;
                    case "sqp":
                        setGameType("Six Qui Prend");
                        break;
                    case "batailleOuverte":
                        setGameType("Bataille Ouverte");
                        break;
                    case "blackjack":
                        setGameType("Black-Jack")
                    default:
                        setGameType("unknow");
                        return;
                }

                console.log(data);
                
                setGameName(data.serverName);
                setMaxPlayers(data.nbPlayerMax);
                setOwner(data.owner);
                setPassword(data.password);
                setTimer(data.timer);
                setMoneyBet(data.moneyBet);
            });

            if (sessionStorage.getItem('loaded') === "true") { return; } else {
                socket.emit('WhereAmI', sessionStorage.getItem('serverConnected')); sessionStorage.setItem('loaded', true)
            }
            socket.on('here', (lobby) => {
                if (mounted) {
                    setLobby(lobby);
                    setPlayerList(lobby.playerList);
                    setMaxPlayers(lobby.nbPlayerMax);

                }


            });

            socket.on("lobbyParams", (maxPlayers, timeBetweenTurn, roundsMax) => {

                if (clobby.owner === sessionStorage.getItem('name')) {
                    return
                } else {
                    if (mounted) {
                        setMaxPlayers(maxPlayers);
                        setTimeBetweenTurn(timeBetweenTurn);
                        setRoundsMax(roundsMax);
                    }

                }


            });

            socket.on('disconected', (name) => {

                if (sessionStorage.getItem("name") === name) {
                    navigate('/BrowserManager');

                }

            });

            socket.on("start", (place) => {

                navigate(`/${place}`);

            });

        }


        return () => { mounted = false };

    }, []);


    function ShowBots({ bots, isShowBots }) {
    
        const getLevelColor = (level) => {
            const maxLevel = 5;
            const hue = 120 - (120 * (level / maxLevel)); // De vert à rouge
            const saturation = 100; // Saturation complète
            const lightness = 50; // Luminosité standard
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        };
        
        return (
            <div className='botList'>
            {bots.map((bot) => (
                <div key={bot.id} className='botInfo' onClick={() => isShowBots(false)}>
                    <img src={bot.imageUrl} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                    {bot.id} | <span style={{ color: getLevelColor(bot.level) }}> niveau : {bot.level}</span>
                    <img src={bot.geoDash} style={{ width: '50px', height: '50px', marginLeft: '10px' }} />
                </div>
            ))}
            </div>
        );
    }

    return (
        <div className='NB-container'>
            <div className='UBwithUnderBandeau'>

                <div className='NB-upperBandeau'>
                    <div className='leaveLobbyButton' onClick={() => leaveGame()}>QUITTER</div>
                    <div className='gameNameType'>{gameName} ({gameType})</div>
                    <div className='lobby-bot' onClick={() => showBots === true ? setShowBots(false) : setShowBots(true)}>Ajouter un Bot</div>
                    <div className='lobby-bot-list'>
                        {showBots && <ShowBots bots={bots} isShowBots={setShowBots} />}      
                    </div>         
                </div>
                <div className='NB-underBandeau'>
                    <div className='waitingPlayerTitle animated-ellipsis'> {` ${!allReady ? "EN ATTENTE DES AUTRES JOUEURS" : "DEBUT DE LA PARTIE "}`}</div>
                    <div className='gameStat'>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="table-title">Propriétaire :</td>
                                    <td className="table-info">{owner}</td>
                                    <td className="table-title">Maximum de joueurs :</td>
                                    <td className="table-info">{maxPlayers}</td>
                                </tr>
                                <tr>
                                    <td className="table-title">Nom de la partie :</td>
                                    <td className="table-info">{gameName}</td>
                                    <td className="table-title">Type de jeu :</td>
                                    <td className="table-info">{gameType}</td>
                                </tr>
                                <tr>
                                    <td className="table-title">Mot de pass :</td>
                                    <td className="table-info">{password ? password : "None"}</td>
                                    <td className="table-title">Temps entre les tours :</td>
                                    <td className="table-info">{timer}</td>
                                </tr>
                                <tr>
                                    <td className="table-title">Argent Parié :</td>
                                    <td className="table-info">{!moneyBet  ? "0" : moneyBet}$</td>
                                    <td className="table-title">Phrase du jour :</td>
                                    <td className="table-info">{quoteOfTheDay}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='bigReadyButton-container'>
                        <div className='bigReadyButton' onClick={handleReadyClick}>{!isReady ? "PRÊT" : "PAS PRÊT"} </div>
                        {clobby.owner === sessionStorage.getItem("name") && <div className='bigReadyButton' onClick={handleStart}>COMMENCER </div>}
                    </div>
                </div>
            </div>

            <div className='NB-playerList'>
                {
                    playerList.map((player, index) => (
                        <div className='playerInList'>
                            <div className='playerInfoContainer'>
                                <div className='playerInfo'>{player.username + "   |   " + (player.isReady ? "Pret" : "Pas pret")} </div>
                                <div></div>
                                {clobby.owner === sessionStorage.getItem("name") && <div className='kickButton' onClick={() => handleKickPlayer(index)} disabled={player.username === sessionStorage.getItem('name') || clobby.owner !== sessionStorage.getItem('name')}>EXPULSER</div>}
                            </div>
                        </div>
                    ))
                }
            </div>

        </div>
    )
}


export default NewLobby