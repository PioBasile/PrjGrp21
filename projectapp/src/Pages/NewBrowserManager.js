import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG';
import './CSS/NewBrowserManager.css'
import './CSS/BrowerManager.css'

const NewBrowserManager = () => {

    const [mesLobby, setMesLobby] = useState([]);
    const [gameSaved, setGameSaved] = useState([])
    const navigate = useNavigate();
    // eslint-disable-next-line
    const [showPopup, setShowPopup] = useState(false);

    const [serverName, setServerName] = useState('');
    const [nbPlayerMax, setNbPlayerMax] = useState(2);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isBet, setIsBet] = useState(false);
    const [password, setPassword] = useState('');
    const [gamePassword, setGamePassword] = useState("");

    const [gameType, setGameType] = useState('');
    const [nbGame, setNbGame] = useState('0');
    const [nbWin, setNbWin] = useState('0');
    const [roundWin, setRoundWin] = useState('0');
    const [money, setMoney] = useState('0');
    const [moneyBet, setMoneyBet] = useState(null);
    const [showSaved, setShowSaved] = useState(false);

    const handleClick = (Id, server) => {
        if (server.isPrivate && gamePassword !== server.password) {
            return;
        }
        socket.emit('joinLobby', sessionStorage.getItem("name"), Id, sessionStorage.getItem("connection_cookie"));
        sessionStorage.setItem('serverConnected', Id);
        sessionStorage.setItem('loaded', false);
        navigate("/Lobby");
    }


    useEffect(() => {

        socket.emit('askStat', sessionStorage.getItem("name"));
        socket.emit("getServ");
        socket.emit("whatGameSaved")

    }, [])


    useEffect(() => {
        let mounted = true;

        if (sessionStorage.getItem("name") == null) { navigate("/login-signup"); }

        socket.on("newServer", (lobbyListId) => {
            if (mounted) {
                setMesLobby(lobbyListId);
            }
        });

        socket.on("stats", (res) => {

            setNbGame(res.nbGames);
            setNbWin(res.nbWin);
            setRoundWin(res.roundWin);
            setMoney(res.argent);

        });

        socket.on("newGameSaved", (allGameSaved) => {
            for (let game of allGameSaved) {
                if (game.startsWith(sessionStorage.getItem("name"))) {
                    setGameSaved([...gameSaved, game])
                }
            }
        })

        return () => {
            mounted = false;
            socket.off("deco");
            socket.off("newServer");
            socket.off("stats");
            socket.off("newGameSaved")
        }

    }, [navigate]);


    const isServerPrivate = () => {
        if (password === "") return false
        else return true
    }


    const handleSave = () => {
        // Logique pour sauvegarder les données du formulaire
        if (gameType === "") { return 0; }
        if (nbPlayerMax === "" || nbPlayerMax < 1) { return 0; }
        socket.emit("newServer", serverName, nbPlayerMax, isServerPrivate(), password, gameType, sessionStorage.getItem('name'), moneyBet);
        setGameType("");
        setNbPlayerMax(2);
        setServerName("");
        setPassword("");
    };

    const handleRecreate = (game) => {

        socket.emit("recreateNewServer", game)

    }

    const whatToLoad = (lobby) => {
        if (lobby.playerList.length === lobby.nbPlayerMax) {
            return "FULL"
        }

        else {
            return `${lobby.playerList.length} / ${lobby.nbPlayerMax}`
        }
    }


    const handlePrivate = () => {
        if (isPrivate) {
            setIsPrivate(false);
            return;
        }
        setIsPrivate(true)
    }

    const handleBet = () => {
        if (isBet) {
            setIsBet(false)
            return;
        }
        setIsBet(true)
    }

    const goToCasinoNigga = () => {
        navigate("/casino")
    }

    const goToItemShop = () => {
        navigate("/itemShop")
    }

    const showSavedGames = () => {
        if (showSaved) setShowSaved(false)
        else setShowSaved(true)
    }

    const leave = () => {
        navigate('/login-signup');
    }


    const GameSaved = () => {
        return (
            <div className='showSaved-container'>
                {gameSaved.map((game, index) => (
                    <div className='gameSaved' onClick={() => handleRecreate(game)}> <div />
                        {game}

                    </div>
                ))}
            </div>
        )

    }

    return (
        <div className='BM-container'>
            <div className='BM-profil'>

                <h2 className='MB-h2 MB-profil-H2'> PROFIL </h2>
                <div className='BM-info-profil hide'>
                    <div className='info-text'> PLAYERNAME : {sessionStorage.getItem("name")}</div>
                </div>
                <div className='BM-info-profil hide'>
                    Parties Jouées : {nbGame}
                </div>
                <div className='BM-info-profil hide'>
                    Parties Gagnées : {nbWin}
                </div>
                <div className='BM-info-profil hide'>
                    ARGENT  : {money}$
                </div>

                <div className='BM-info-profil hide'>
                    Round gagnés : {roundWin}
                </div>

                <div className='BM-info-profil hide casino' onClick={goToCasinoNigga}>
                    CASINO
                </div>
                <div className='BM-info-profil hide itemShop' onClick={goToItemShop}>
                    ITEM SHOP
                </div>
            </div>

            <div className='BM-acttion-container'>
                <h2 className='MB-h2'> CREER LE SERVER</h2>



                <div className='BM-input-container'>

                    <input type="text" id="BM-serverName" className="BM-input" placeholder='Server name...' value={serverName} onChange={(e) => { setServerName(e.target.value); }} ></input>

                    <div className='checkbox-container'>
                        <div className='checkbox' onClick={handlePrivate}>Private Sever ?</div>
                        <div className='checkbox' onClick={handleBet}>Want to Bet ?</div>
                    </div>

                    {isPrivate && <input type="password" id="BM-password" className="BM-input" placeholder='Password...' value={password} onChange={(e) => setPassword(e.target.value)}></input>}
                    {isBet && <input type="number" id="BM-moneyBet" className="BM-input" placeholder='Money to bet' value={moneyBet} onChange={(e) => setMoneyBet(e.target.value)}></input>}
                    {showSaved && <GameSaved></GameSaved>}

                    <input type="number" className="BM-input gameNameMargin" placeholder='Player number' value={nbPlayerMax} onChange={(e) => setNbPlayerMax(e.target.value)}></input>

                    <div className='select-container'>
                        <label htmlFor="gameType"></label>
                        <select className="select-dropdown" id="gameType" value={gameType} onChange={(e) => setGameType(e.target.value)}>
                            <option value="">Type de jeu</option>
                            <option value="batailleOuverte">Bataille Ouverte</option>
                            <option value="sqp">Six qui prend</option>
                            <option value="mb">Mille Bornes</option>
                            <option value="rd">Random</option>
                        </select>
                        <div className="select-arrow"></div>
                    </div>
                </div>

                <div className='BM-creerButton-container'>
                    <div></div>
                    <button onClick={handleSave} className="BM-button">CRÉER</button>
                    <div></div>
                </div>

                <div className='gameSavedButton'>
                    <div className='BM-save-button' onClick={showSavedGames}> GAME SAVED </div>
                </div>

                <div className='BM-leave-container'>
                    <button className='BM-leave' onClick={leave}> LEAVE </button>
                </div>

            </div>
            {/* du vide */}

            <div className='BM-serverList-container'>

                <h2 className='MB-h2'> SERVER LIST</h2>
                {mesLobby.map((lobby, _) => (

                    <div className='BM-server' onClick={() => handleClick(lobby.id, lobby)}>{lobby.serverName} ({lobby.gameType}) {whatToLoad(lobby)}
                        {lobby.isPrivate && <input id={`gamePassWord` + lobby.id} type="password" className="BM-input-server" placeholder='Mot de passe...' value={gamePassword} onChange={(e) => {
                            setGamePassword(e.target.value);
                        }}></input>}
                    </div>

                ))}
            </div>
        </div>
    )
}

export default NewBrowserManager
