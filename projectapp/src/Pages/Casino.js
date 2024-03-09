import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './CSS/Casino.css';
import socket from '../socketG.js'


const Casino = () => {
    const [serverName, setServerName] = useState("");
    const [nbPlayerMax, setNbPlayerMax] = useState(0);
    const [mesLobby, setMesLobby] = useState([]);
    const navigate = useNavigate();
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [gamePassword, setGamePassword] = useState("");

    const [gameType, setGameType] = useState('');

    const [money, setMoney] = useState('0');



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

    useEffect(() => {
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
                lobbyListId.forEach((lobby) => {
                    if(lobby.gameType === "roulette" || lobby.gameType === "blackjack"){
                        setMesLobby([...mesLobby, lobby])
                    }
                })
            }
        });


        socket.on("stats", (res) => {

            setMoney(res.argent);

        });

        return () => {
            mounted = false;
            socket.off("deco");
            socket.off("newServer");
            socket.off("stats");
        }

    }, [navigate, mesLobby]);


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
        socket.emit("newServer", serverName, nbPlayerMax, isServerPrivate(), password, gameType, sessionStorage.getItem('name'), 0);
        setGameType("");
        setNbPlayerMax(2);
        setServerName("");
        setPassword("");
    };


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


    return (
        <div className="casino-container">
            <div className="casino-upper-bandeau">
                <div className="casino-leave"> LEAVE </div>
                <div className="casino-moneyContainer">{money}$</div>
                <div></div>
                <div></div>

            </div>
            <div className="underTheBandeau">
                <div className="casino-input-container">
                    <input type="text" id="BM-serverName" className="BM-input casino-input" placeholder='Server name...' value={serverName} onChange={(e) => { setServerName(e.target.value); }} ></input>
                    <input type="number" className="BM-input casino-input" placeholder='Player number' value={nbPlayerMax} onChange={(e) => setNbPlayerMax(e.target.value)}></input>
                    <div className='checkbox-container'>
                        <div className='checkbox' onClick={handlePrivate}>Server Private ?</div>
                    </div>
                    {isPrivate && <input type="password" id="BM-nbPlayer" className="BM-input casino-input" placeholder='Password...' value={setNbPlayerMax} onChange={(e) => { setNbPlayerMax(e.target.value); }} ></input>}
                    <div className='select-container'>
                        <label htmlFor="gameType"></label>
                        <select className="select-dropdown" id="gameType" value={gameType} onChange={(e) => setGameType(e.target.value)}>
                            <option value="">Type de jeu</option>
                            <option value="roulette">Roulette</option>
                            <option value="blackJack">BlackJack</option>
                        </select>
                        <div className="select-arrow"></div>
                    </div>
                    <div className="casino-create-button" onClick={handleSave}>CREATE</div>
                </div>

                <div className="casino-serverList-container">

                    {
                        mesLobby.map((lobby, _) => (
                            <div className='casino-server' onClick={() => handleClick(lobby.id, lobby)}>{lobby.serverName} ({lobby.gameType}) {whatToLoad(lobby)}
                                {lobby.isPrivate && <input id={`gamePassWord` + lobby.id} type="password" className="BM-input-server" placeholder='Mot de passe...' value={gamePassword} onChange={(e) => {
                                    setGamePassword(e.target.value);
                                }}></input>}
                            </div>
                        ))}
                </div>
            </div>

        </div>
    )
}


export default Casino