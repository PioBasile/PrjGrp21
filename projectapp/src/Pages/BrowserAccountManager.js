
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
import {useEffect, useState} from "react";
import ServerList from "./ServerList";
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/PopUpStyle.css';
import { Button, Modal, Form } from 'react-bootstrap'; 





const socket = io.connect("http://localhost:3001")
function BrowserAccountManager(){
  
  socket.emit('leave', sessionStorage.getItem("serverConnected"));
  sessionStorage.setItem('serverConnected',-1);
  
  const [mesLobby, setMesLobby] = useState([]);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [serverName, setServerName] = useState('');
  const [nbPlayerMax, setNbPlayerMax] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState(false);
  const [gameType, setGameType] = useState('');

  const handleClose = () => setShowPopup(false);
  const handleShow = () => setShowPopup(true);

  const handleClick = (Id,server) => {
    if(server.isPrivate && password != server.password){
      return;
    }
    console.log("new page asked");
    socket.emit('joinLobby', sessionStorage.getItem("name"), Id, sessionStorage.getItem("connection_cookie"));
    sessionStorage.setItem('serverConnected',Id);
    sessionStorage.setItem('loaded',false);
    navigate("/Lobby");
  }

  const handlePassword = (passwordd) => {
    setPassword(passwordd);
  }


  useEffect(() => {
    let mounted = true;
    console.log("La page React est chargée !");
    socket.emit("getServ");

    if(sessionStorage.getItem("name") == null ){navigate("/login-signup");}
    socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"))

    socket.on("deco", (name)=>{
      if(mounted){
        navigate("/login-signup");
      }
    });

    socket.on("newServer", (lobbyListId) => {
      if(mounted){
        setMesLobby(lobbyListId);
      }
    });

    return () => {mounted = false};

    
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useNavigate]); 




  const handleSave = () => {
    // Logique pour sauvegarder les données du formulaire

    if(gameType === ""){return 0;}
    if(nbPlayerMax === ""){return 0;}
    socket.emit("newServer", serverName, nbPlayerMax, isPrivate, password, gameType, sessionStorage.getItem('name'));
    handleClose(); // Fermer la popup après sauvegarde
  };


  return (
    <div>  

      

      <div>

      <Button variant="primary" onClick={handleShow}>
        Crée un server
      </Button>


      <ServerList servers={mesLobby} handleClick={handleClick} handlePassword={handlePassword}/>
      <Modal show={showPopup} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Paramètres du serveur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="serverName">
              <Form.Label>Nom du serveur</Form.Label>
              <Form.Control type="text" value={serverName} onChange={(e) => setServerName(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="nbPlayerMax">
              <Form.Label>Nombre maximal de joueurs</Form.Label>
              <Form.Control type="number" value={nbPlayerMax} onChange={(e) => setNbPlayerMax(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="isPrivate">
              <Form.Check
                type="checkbox"
                label="Serveur privé"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
            </Form.Group>

            {isPrivate && (
              <Form.Group controlId="password">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Form.Group>
            )}

            <Form.Group controlId="gameType">
              <Form.Label>Type de jeu</Form.Label>
              <Form.Control as="select" value={gameType} onChange={(e) => setGameType(e.target.value)}>
                <option value="">Sélectionner le type de jeu</option>
                <option value="batail_ouverte">Bataille Ouverte</option>
                {/* Ajoutez d'autres options selon vos besoins */}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
</div>
  )
}

export default BrowserAccountManager;

