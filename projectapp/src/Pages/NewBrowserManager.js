import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG';
import './CSS/NewBrowserManager.css'

const NewBrowserManager = () => {

    const [mesLobby, setMesLobby] = useState([]);
    const navigate = useNavigate();
    // eslint-disable-next-line
    const [showPopup, setShowPopup] = useState(false);

    const [serverName, setServerName] = useState('');
    const [nbPlayerMax, setNbPlayerMax] = useState(2);
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [gamePassword, setGamePassword] = useState("");

    const [gameType, setGameType] = useState('');
    const [nbGame, setNbGame] = useState('0');
    const [nbWin, setNbWin] = useState('0');
    const [roundWin, setRoundWin] = useState('0');
    const [money, setMoney] = useState('0');



    const ElementAvecBouton = ({ children }) => {
        const [boutonVisible, setBoutonVisible] = useState(false);

        return (
            <div
                className={`element-container ${boutonVisible ? 'visible' : ''}`}
                onMouseEnter={() => setBoutonVisible(true)}
                onMouseLeave={() => setBoutonVisible(false)}
            >
                {children}
            </div>
        );
    };

    const handleClick = (Id, server) => {
        console.log(password, server.password);
        if (server.isPrivate && password !== server.password) {
            return;
        }
        console.log("new page asked");
        socket.emit('joinLobby', sessionStorage.getItem("name"), Id, sessionStorage.getItem("connection_cookie"));
        sessionStorage.setItem('serverConnected', Id);
        sessionStorage.setItem('loaded', false);
        navigate("/Lobby");
    }

    const handlePassword = (passwordd) => {
        setPassword(passwordd);
    }

    useEffect(() => {


        socket.emit('askStat', sessionStorage.getItem("name"));

        // GESTION stabilité de la connection
        socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"))
        socket.emit("getServ");

    }, [])


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

        return () => {
            mounted = false;
            socket.off("deco");
            socket.off("newServer");
            socket.off("stats");
        }

    }, [navigate]);


    const isServerPrivate = () => {
        console.log(password);
        if (password === "") return false
        else return true
    }


    const handleSave = () => {
        // Logique pour sauvegarder les données du formulaire
        if (gameType === "") { return 0; }
        if (nbPlayerMax === "" || nbPlayerMax < 1) { return 0; }
        console.log(gameType, nbPlayerMax, serverName, isServerPrivate());
        socket.emit("newServer", serverName, nbPlayerMax, isServerPrivate(), password, gameType, sessionStorage.getItem('name'));
        setGameType("");
        setNbPlayerMax(2);
        setServerName("");
        setPassword("");
    };

    const canJoin = (lobby) => {
        if (isPrivate) {
            if (lobby.password === password) {
                return true
            }
            else if (lobby.playerList === lobby.nbPlayerMax) {
                return false
            }
            else {
                return false
            }
        }
        else {
            return true
        }
    }


    const whatToLoad = (lobby) => {
        if (lobby.playerList.length === lobby.nbPlayerMax) {
            return "FULL"
        }

        else {
            return `${lobby.playerList.length} / ${lobby.nbPlayerMax}`
        }
    }
    return (
        <div className='BM-container'>
            <div className='BM-profil'>

                <h2 className='MB-h2 MB-profil-H2'> PROFIL </h2>
                <div className='BM-info-profil hide'>
                    <div className='info-text'>PLAYERNAME: {sessionStorage.getItem("name")}</div>
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

                <div className='BM-info-profil hide casino'>
                    CASINO
                </div>
            </div>

            <div className='BM-acttion-container'>
                <h2 className='MB-h2'> CREER LE SERVER</h2>

                <div className='BM-input-container'>

                    <input type="text" id="BM-serverName" className="BM-input" placeholder='Nom Partie...' value={serverName} onChange={(e) => { setServerName(e.target.value); }} ></input>
                    <input type="password" id="BM-password" className="BM-input" placeholder='Mot de passe...' value={password} onChange={(e) => setPassword(e.target.value)}></input>
                    <input type="number" className="BM-input gameNameMargin" placeholder='Nombre de joueurs' value={nbPlayerMax} onChange={(e) => setNbPlayerMax(e.target.value)}></input>

                    <div className='select-container'>
                        <label htmlFor="gameType"></label>
                        <select className="select-dropdown" id="gameType" value={gameType} onChange={(e) => setGameType(e.target.value)}>
                            <option value="">Type de jeu</option>
                            <option value="batail_ouverte">Bataille Ouverte</option>
                            <option value="sqp">Six qui prend</option>
                            <option value="mb">Mille Bornes</option>
                        </select>
                        <div className="select-arrow"></div>
                    </div>
                </div>

                <div className='BM-creerButton-container'>
                    <div></div>
                    <button onClick={handleSave} className="BM-button">CRÉER</button>
                    <div></div>
                </div>

            </div>
            {/* du vide */}

            <div className='BM-serverList-container'>

                <h2 className='MB-h2'> SERVER LISTE</h2>x
                {mesLobby.map((lobby, _) => (
                    <ElementAvecBouton>
                        <div className='BM-server' onClick={() => handleClick(lobby.id, lobby)}>{lobby.serverName} ({lobby.gameType}) {whatToLoad(lobby)}
                            {lobby.isPrivate && <input id={`gamePassWord` + lobby.id} type="password" className="BM-input-server" placeholder='Mot de passe...' value={gamePassword} onChange={(e) => {
                                setGamePassword(e.target.value);
                            }}></input>}
                        </div>
                    </ElementAvecBouton>
                ))};
            </div>


        </div>
    )
}

export default NewBrowserManager