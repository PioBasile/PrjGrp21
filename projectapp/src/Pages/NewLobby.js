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
    const [timer, setTimer] = useState(0)


    const [allReady, setAllReady] = useState(false)
    const [timeBetweenTurn, setTimeBetweenTurn] = useState(30);
    const [roundsMax, setRoundsMax] = useState(20);
    const navigate = useNavigate();
    const [clobby, setLobby] = useState({ playerList: [] });



    function setPlayer(maxP) {

        setMaxPlayers(maxP);
        socket.emit('updateParam', sessionStorage.getItem('serverConnected'), maxP, timeBetweenTurn, roundsMax);

    };

    function setRound(maxR) {

        setRoundsMax(maxR);
        socket.emit('updateParam', sessionStorage.getItem('serverConnected'), maxPlayers, timeBetweenTurn, maxR);

    };

    function setTimeTurn(time) {

        setTimeBetweenTurn(time)
        socket.emit('updateParam', sessionStorage.getItem('serverConnected'), maxPlayers, time, roundsMax);

        return () => {
            socket.off("failure");
            socket.off("succes");
        }
    };

    function leaveGame() {
        socket.emit('leaveGame', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
        socket.emit('leave', sessionStorage.getItem('serverConnected'));
        navigate('/');
    };



    const handleKickPlayer = (index) => {
        socket.emit('deco_lobby', sessionStorage.getItem('serverConnected'), playerList[index].username);
    };

    const handleReadyClick = () => {
        socket.emit('ready', sessionStorage.getItem('serverConnected'), sessionStorage.getItem('name'));
    };

    const handleDisconnectClick = () => {
        socket.emit('deco_lobby', sessionStorage.getItem("serverConnected"), sessionStorage.getItem('name'));
        navigate('/BrowserManager');
    };

    const handleStart = () => {

        let count = 0;
        clobby.playerList.forEach(player => {
            if (player.isReady) { count++; }
        });

        if (count === clobby.nbPlayerMax && clobby.owner === sessionStorage.getItem('name')) {
            setAllReady(true)
            setTimeout(() => {
                socket.emit("StartGame", sessionStorage.getItem('serverConnected'));
            }, "5000")
        };

    }

    useEffect(() => {

        if (sessionStorage.getItem('serverConnected') === "-1") {
            navigate("/BrowserManager");
        }

        // GESTION stabilité de la connection
        socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"))
        socket.emit("getServ");
        socket.emit("lobbyInfo_UwU", sessionStorage.getItem('serverConnected'))

    }, [navigate])


    useEffect(() => {

        let mounted = true;

        // GESTION stabilité de la connection

        if (sessionStorage.getItem("name") == null) { navigate("/login-signup"); }

        socket.on("deco", (name) => {
            if (mounted) {
                navigate("/login-signup");
            }
        });

        // -----------------

        socket.on("yourInfoBebs",(data) => {

            switch (data.gameType) {
                case "mb":  
                    setGameType("Mille Bornes");
                    break
                case "rd":  
                    setGameType("Random");
                    break
                case "sqp":  
                    setGameType("Six Qui Prend");
                    break
                case "batailleOuverte": 
                    setGameType("Bataille Ouverte");
                default:
                    setGameType("unknow");
            }

            setGameName(data.serverName);
            setMaxPlayers(data.nbPlayerMax);
            setOwner(data.owner);
            setPassword(data.password);
            setTimer(data.timer)
        })

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


        return () => { mounted = false };

    }, [clobby.owner, navigate]);

    return (
        <div className='NB-container'>
            <div className='UBwithUnderBandeau'>

                <div className='NB-upperBandeau'>
                    <div className='leaveLobbyButton' onClick={() => leaveGame()}>LEAVE</div>
                    <div className='gameNameType'>{gameName} ({gameType})</div>
                    <div></div>
                </div>
                <div className='NB-underBandeau'>
                    <div className='waitingPlayerTitle animated-ellipsis'> {` ${!allReady ? "WAITING FOR PLAYERS" : "GAME STARTING "}`}</div>
                    <div className='gameStat'>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="table-title">Owner :</td>
                                    <td className="table-info">{owner}</td>
                                    <td className="table-title">maxPlayer :</td>
                                    <td className="table-info">{maxPlayers}</td>
                                </tr>
                                <tr>
                                    <td className="table-title">gameName :</td>
                                    <td className="table-info">{gameName}</td>
                                    <td className="table-title">gameType :</td>
                                    <td className="table-info">{gameType}</td>
                                </tr>
                                <tr>
                                    <td className="table-title">password :</td>
                                    <td className="table-info">{ password ? password : "None"}</td>
                                    <td className="table-title">Timer :</td>
                                    <td className="table-info">{timer}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='bigReadyButton-container'>
                        <div className='bigReadyButton' onClick={handleReadyClick}>READY </div>
                        {clobby.owner === sessionStorage.getItem("name") && <div className='bigReadyButton' onClick={handleStart}>START </div>}
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
                                {clobby.owner === sessionStorage.getItem("name") &&<div className='kickButton' onClick={() => handleKickPlayer(index)} disabled={player.username === sessionStorage.getItem('name') || clobby.owner !== sessionStorage.getItem('name')}>KICK</div>}
                            </div>
                        </div>
                    ))
                }
            </div>

        </div>
    )
}


export default NewLobby