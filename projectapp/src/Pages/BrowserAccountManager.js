
/*   INSTALLATION

├── bootstrap@5.3.2
├── cors@2.8.5
├── cra-template@1.2.0
├── d3-polygon@3.0.1
├── d3@7.8.5
├── error@10.4.0
├── express-session@1.17.3
├── express@4.18.2
├── loglevel@1.8.1
├── node@21.2.0
├── nodemon@3.0.2
├── react-dom@18.2.0
├── react-scripts@5.0.1
├── react@18.2.0
└── socket.io@4.7.2
*/

import io from 'socket.io-client';
import { useEffect, useState } from "react";
import ServerList from "./ServerList";
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/PopUpStyle.css';
import { Button, Modal, Form } from 'react-bootstrap';


const socket = io.connect("http://localhost:3001")
function BrowserAccountManager() {

  socket.emit('leave', sessionStorage.getItem("serverConnected"));
  sessionStorage.setItem('serverConnected', -1);

  const [mesLobby, setMesLobby] = useState([]);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [serverName, setServerName] = useState('');
  const [nbPlayerMax, setNbPlayerMax] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState(false);
  const [gameType, setGameType] = useState('');
  const [nbGame, setNbGame] = useState('0');
  const [nbWin, setNbWin] = useState('0');
  const [cartePref, setCartePref] = useState('0');
  const [roundWin, setRoundWin] = useState('0');
  const [elo, setElo] = useState('0');
  const [action, setAction] = useState("Create Server");

  const handleClose = () => setShowPopup(false);
  const handleShow = () => setShowPopup(true);

  const handleClick = (Id, server) => {
    if (server.isPrivate && password != server.password) {
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
    let mounted = true;
    console.log("La page React est chargée !");
    socket.emit("getServ");

    if (sessionStorage.getItem("name") == null) { navigate("/login-signup"); }
    socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"))

    socket.on("deco", (name) => {
      if (mounted) {
        navigate("/login-signup");
      }
    });

    socket.on("newServer", (lobbyListId) => {
      if (mounted) {
        setMesLobby(lobbyListId);
      }
    });

    return () => { mounted = false };


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useNavigate]);




  const handleSave = () => {
    // Logique pour sauvegarder les données du formulaire

    if (gameType === "") { return 0; }
    if (nbPlayerMax === "") { return 0; }
    socket.emit("newServer", serverName, nbPlayerMax, isPrivate, password, gameType, sessionStorage.getItem('name'));
    handleClose(); // Fermer la popup après sauvegarde
  };


  const CreateServer = () => {
    return (

      <div class="inputs">
        <div class='input'>
          <label for="serverName">Nom du serveur</label>
          <input
            type="text"
            id="serverName"
            value={serverName}
            onChange={(e) => {
              setServerName(e.target.value);
            }}
          />
        </div>
        <div class='input'>
          <label for="nbPlayerMax">Nombre maximal de joueurs</label>
          <input type="number" id="nbPlayerMax" value={nbPlayerMax} onChange={(e) => setNbPlayerMax(e.target.value)} />
        </div>
        <div class="checkbox-container">
          <label for="isPrivate" className='text-white'>
            Serveur privé ? { }

            <input type="checkbox" id="isPrivate" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          </label>
        </div>


        {isPrivate && (
          <div class="input">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        )}
        <div className='select-container'>
          <label for="gameType"></label>
          <select class="select-dropdown" id="gameType" value={gameType} onChange={(e) => setGameType(e.target.value)}>
            <option value="">Type de jeu</option>
            <option value="batail_ouverte">Bataille Ouverte</option>
          </select>
          <div class="select-arrow"></div>
        </div>
        <div class="submit server" onClick={handleSave}>Créer</div>


      </div>
    )
  }


  const Profil = () => {
    const [animation, setAnimation] = useState('card');
    return (
      <div className="profil-container">
        <div className="profil-title">
          <h5>Statistiques du Joueur</h5>
        </div>
        <div className="profil-body">

          <div class="card" id="myCard">
            <div class="card-inner">
              <div>userName</div>
              <div class="card-front"></div>
              <div class="card-back">
                <div class="card-back-text">{sessionStorage.getItem("name")}</div>
              </div>
            </div>
          </div>

          <div class="card" id="myCard">
            <div class="card-inner">
              <div>game play</div>
              <div class="card-front"></div>
              <div class="card-back">
                <div class="card-back-text">{nbGame}</div>
              </div>
            </div>
          </div>

          <div class="card" id="myCard">
            <div class="card-inner">
              <div>games win</div>
              <div class="card-front"></div>
              <div class="card-back">
                <div class="card-back-text">{nbWin}</div>
              </div>
            </div>
          </div>

          <div class="card" id="myCard">
            <div class="card-inner">
              <div>ELO</div>
              <div class="card-front"></div>
              <div class="card-back">
                <div class="card-back-text">{elo}</div>
              </div>
            </div>
          </div>

          <div class="card" id="myCard">
            <div class="card-inner">
              <div>round WIN</div>
              <div class="card-front"></div>
              <div class="card-back">
                <div class="card-back-text">{roundWin}</div>
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

        {action == "Create Server" ? <div><CreateServer /></div> : <div></div>}
        {action == "Server List" ? <ServerList servers={mesLobby} handleClick={handleClick} /> : <div></div>}
        {action == "Profil" ? <Profil /> : <div></div>}

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

