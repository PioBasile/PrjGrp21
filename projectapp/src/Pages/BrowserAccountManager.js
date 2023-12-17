
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
import { useEffect, useState, useRef } from "react";
import ServerList from "./ServerList";
import { useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/BrowserManager.css';
// import { Button, Modal, Form } from 'react-bootstrap';


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
  const [name, setName] = useState('');

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
    setAction("Server List")
    if (gameType === "") { return 0; }
    if (nbPlayerMax === "") { return 0; }
    socket.emit("newServer", serverName, nbPlayerMax, isPrivate, password, gameType, sessionStorage.getItem('name'));
    handleClose(); // Fermer la popup après sauvegarde
  };



  const Profil = () => {
    return (

      <div class="profil-container">
        <div class="profil-title">
          <h5>Statistiques du Joueur</h5>
        </div>
        <div class="profil-body">

          <div class="carte" id="myCard">
            <div class="carte-inner">
              <div><strong>username</strong></div>
              <div class="carte-front"></div>
              <div class="carte-back">
                <div class="carte-back-text">{sessionStorage.getItem("name")}</div>
              </div>
            </div>
          </div>

          <div class="carte" id="myCard">
            <div class="carte-inner">
              <div><strong>game played</strong></div>
              <div class="carte-front"></div>
              <div class="carte-back">
                <div class="carte-back-text">{nbGame}</div>
              </div>
            </div>
          </div>

          <div class="carte" id="myCard">
            <div class="carte-inner">
              <div><strong>game win</strong></div>
              <div class="carte-front"></div>
              <div class="carte-back">
                <div class="carte-back-text">{nbWin}</div>
              </div>
            </div>
          </div>

          <div class="carte" id="myCard">
            <div class="carte-inner">
              <div><strong>ELO</strong></div>
              <div class="carte-front"></div>
              <div class="carte-back">
                <div class="carte-back-text">{elo}</div>
              </div>
            </div>
          </div>

          <div class="carte" id="myCard">
            <div class="carte-inner">
              <div><strong>round win</strong></div>
              <div class="carte-front"></div>
              <div class="carte-back">
                <div class="carte-back-text">{roundWin}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div class='vide'>
      <div class='container'>
        <div class='header'>
          <div class='text'>{action}</div>
          <div class="underline"></div>
        </div>

        {action == "Create Server" ? <div class="inputs">
          <div class='input'>
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
          <div class='input'>
            <label htmlFor="nbPlayerMax"></label>
            <input type="number" id="nbPlayerMax" value={nbPlayerMax} onChange={(e) => setNbPlayerMax(e.target.value)} />
          </div>
          <div class="checkbox-container">
            <label htmlFor="isPrivate" class='text-white'>
              Serveur privé ? { }

              <input type="checkbox" id="isPrivate" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            </label>
          </div>

          {isPrivate && (
            <div class="input">
              <label htmlFor="password">Mot de passe</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <div class='select-container'>
            <label htmlFor="gameType"></label>
            <select class="select-dropdown" id="gameType" value={gameType} onChange={(e) => setGameType(e.target.value)}>
              <option value="">Type de jeu</option>
              <option value="batail_ouverte">Bataille Ouverte</option>
            </select>
            <div class="select-arrow"></div>
          </div>
          <div class="submit server" onClick={handleSave}>Créer</div>


        </div>
          : <div></div>}
        {action == "Server List" ? <ServerList servers={mesLobby} handleClick={handleClick} handlePassword={handlePassword} /> : <div></div>}
        {action == "Profil" ? <Profil /> : <div></div>}

        <div class='submit-container'>
          <div class={action === "Create Server" ? 'submit gray' : 'submit'} onClick={() => { setAction("Create Server") }}>Create Server</div>
          <div class={action === "Server List" ? 'submit gray' : 'submit'} onClick={() => { setAction("Server List") }}>Server List</div>
          <div class={action === "Profil" ? 'submit gray' : 'submit'} onClick={() => { setAction("Profil") }}>Profil</div>
        </div>
      </div>
    </div>
  )
};


export default BrowserAccountManager;

