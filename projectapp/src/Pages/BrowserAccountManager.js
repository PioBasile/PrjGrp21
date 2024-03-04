
import { useEffect, useState  } from "react";
import ServerList from "./ServerList";
import { useNavigate } from 'react-router-dom';
import './CSS/BrowerManager.css';
import socket from '../socketG.js'

const BrowserAccountManager = () => {



  const [mesLobby, setMesLobby] = useState([]);
  const navigate = useNavigate();
  // eslint-disable-next-line
  const [showPopup, setShowPopup] = useState(false);
  const [serverName, setServerName] = useState('');
  const [nbPlayerMax, setNbPlayerMax] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [gameType, setGameType] = useState('');
  const [nbGame, setNbGame] = useState('0');
  const [nbWin, setNbWin] = useState('0');
  const [roundWin, setRoundWin] = useState('0');
  const [elo, setElo] = useState('0');
  const [action, setAction] = useState("Create Server");

  const handleClose = () => setShowPopup(false);


  const handleClick = (Id, server) => {
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
      setElo(res.argent);

    });

    return () => {
      mounted = false;
      socket.off("deco");
      socket.off("newServer");
      socket.off("stats");
    }

  }, [navigate]);




  const handleSave = () => {
    // Logique pour sauvegarder les données du formulaire
    if (gameType === "") { return 0; }
    if (nbPlayerMax === "" || nbPlayerMax < 1) { return 0; }
    socket.emit("newServer", serverName, nbPlayerMax, isPrivate, password, gameType, sessionStorage.getItem('name'));
    setAction("Server List");
    handleClose(); 
  };



  const Profil = () => {
    return (

      <div className="profil-container">
        <div className="profil-title">
          <h5>Statistiques du Joueur</h5>
        </div>
        <div className="profil-body">

          <div className="carte" id="myCard">
            <div><strong>username</strong></div>
            <div className="carte-inner">
              <div className="carte-front"></div>
              <div className="carte-back">
                <div className="carte-back-text">{sessionStorage.getItem("name")}</div>
              </div>
            </div>
          </div>

          <div className="carte" id="myCard">
            <div><strong>game played</strong></div>
            <div className="carte-inner">
              <div className="carte-front"></div>
              <div className="carte-back">
                <div className="carte-back-text">{nbGame}</div>
              </div>
            </div>
          </div>

          <div className="carte" id="myCard">
            <div><strong>game win</strong></div>
            <div className="carte-inner">
              <div className="carte-front"></div>
              <div className="carte-back">
                <div className="carte-back-text">{nbWin}</div>
              </div>
            </div>
          </div>

          <div className="carte" id="myCard">
            <div><strong>Argent</strong></div>
            <div className="carte-inner">
              <div className="carte-front"></div>
              <div className="carte-back">
                <div className="carte-back-text">{elo + "$"}</div>
              </div>
            </div>
          </div>

          <div className="carte" id="myCard">
            <div><strong>round win</strong></div>
            <div className="carte-inner">
              <div className="carte-front"></div>
              <div className="carte-back">
                <div className="carte-back-text">{roundWin}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='vide'>
      <div className='container'>
        <div className='header'>
          <div className='text'>{action}</div>
          <div className="underline"></div>
        </div>

        {action === "Create Server" ? <div className="inputs">
          <div className='input'>
            <label htmlFor="serverName"> </label>
            <input
              placeholder='server name'
              type="text"
              id="serverName"
              value={serverName}
              onChange={(e) => {
                setServerName(e.target.value);
              }}
            />
          </div>
          <div className='input'>
            <label htmlFor="nbPlayerMax"></label>
            <input type="number" placeholder= "nbPlayer" id="nbPlayerMax" value={nbPlayerMax} onChange={(e) => setNbPlayerMax(e.target.value)} />
          </div>
          <div className="checkbox-container">
            <label htmlFor="isPrivate" className='text-white'>
              Serveur privé ? { }

              <input type="checkbox" id="isPrivate" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            </label>
          </div>

          {isPrivate && (
            <div className="input">
              <label htmlFor="password"></label>
              <input type="password" id="password"  placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <div className='select-container'>
            <label htmlFor="gameType"></label>
            <select className="select-dropdown" id="gameType" value={gameType} onChange={(e) => setGameType(e.target.value)}>
              <option value="">Type de jeu</option>
              <option value="batail_ouverte">Bataille Ouverte</option>
              <option value="sqp">Six qui prend</option>
              <option value="mb">Mille Borne</option>
            </select>
            <div className="select-arrow"></div>
          </div>
          <div className="submit server" onClick={handleSave}>Créer</div>


        </div>
          : <div></div>}
        {action === "Server List" ? <ServerList servers={mesLobby} handleClick={handleClick} handlePassword={handlePassword} /> : <div></div>}
        {action === "Profil" ? <Profil /> : <div></div>}

        <div className='submit-container'>
          <div className={action === "Create Server" ? 'submit gray' : 'submit'} onClick={() => { setAction("Create Server") }}>Create Server</div>
          <div className={action === "Server List" ? 'submit gray' : 'submit'} onClick={() => { setAction("Server List") }}>Server List</div>
          <div className={action === "Profil" ? 'submit gray' : 'submit'} onClick={() => { setAction("Profil") }}>Profil</div>
        </div>
      </div>
    </div>
  )
};


export default BrowserAccountManager;

