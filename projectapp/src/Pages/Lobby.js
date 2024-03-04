import React, { useEffect, useState } from 'react';
import './CSS/LobbyStyleSheet.css'
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { Button, ListGroup, Form } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';
import socket from '../socketG';


const Lobby = () => {
  
  socket.emit('join', sessionStorage.getItem('serverConnected'));
  sessionStorage.setItem('loaded',false);
  const [playerList, setPlayerList] = useState([ ]);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [timeBetweenTurn, setTimeBetweenTurn] = useState(30);
  const [roundsMax, setRoundsMax] = useState(20);
  const navigate = useNavigate();
  const [clobby, setLobby] = useState({playerList:[]});

  function setPlayer(maxP){

    setMaxPlayers(maxP);
    socket.emit('updateParam',sessionStorage.getItem('serverConnected') ,maxP, timeBetweenTurn, roundsMax);

  };

  function setRound(maxR){

    setRoundsMax(maxR);
    socket.emit('updateParam',sessionStorage.getItem('serverConnected') ,maxPlayers, timeBetweenTurn, maxR);

  };

  function setTimeTurn(time){

    setTimeBetweenTurn(time)
    socket.emit('updateParam',sessionStorage.getItem('serverConnected') ,maxPlayers, time, roundsMax);

  };


  const handleKickPlayer = (index) => {
    socket.emit('deco_lobby', sessionStorage.getItem('serverConnected') ,playerList[index].username);
  };

  const handleReadyClick = () => {
    socket.emit('ready', sessionStorage.getItem('serverConnected'),sessionStorage.getItem('name'));
  };

  const handleDisconnectClick = () => {
    socket.emit('deco_lobby', sessionStorage.getItem("serverConnected"), sessionStorage.getItem('name'));
    navigate('/BrowserManager');
  };

  const handleStart = () => {

      let count = 0;
      clobby.playerList.forEach(player => {
        if(player.isReady){count++;}
      });

      if(count === clobby.nbPlayerMax && clobby.owner === sessionStorage.getItem('name')){
        socket.emit("StartGame", sessionStorage.getItem('serverConnected'));
      };

  }

  useEffect(() => {

    if(sessionStorage.getItem('serverConnected')==="-1"){
      navigate("/BrowserManager");
    }

    // GESTION stabilité de la connection
    socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"))
    socket.emit("getServ");

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


    if(sessionStorage.getItem('loaded') === "true"){return;}else{
      socket.emit('WhereAmI',sessionStorage.getItem('serverConnected'));sessionStorage.setItem('loaded',true)
    }
    socket.on('here',(lobby) => {
      if(mounted){
      setLobby(lobby);
      setPlayerList(lobby.playerList);
      setMaxPlayers(lobby.nbPlayerMax);

    }
      

    });

    socket.on("lobbyParams", (maxPlayers, timeBetweenTurn, roundsMax) => {

      if(clobby.owner === sessionStorage.getItem('name')){
        return
      } else {
        if(mounted){
          setMaxPlayers(maxPlayers);
          setTimeBetweenTurn(timeBetweenTurn);
          setRoundsMax(roundsMax);
        }
        
      }
      

    }); 

    socket.on('disconected', (name) => {

      if(sessionStorage.getItem("name") === name){
        navigate('/BrowserManager');

      }

    });

    socket.on("start" , (place) => {

      
      navigate(`/${place}`);

    });

    
    return () => {mounted = false};

  }, [clobby.owner,navigate]);


  return (
<div className="app-container">
      <div className="left-panel">
        <h2 className="text-white">Joueurs</h2>
        <ListGroup>
          {playerList.map((player, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              {index+1 + " "}
              {player.username + " | " + (player.isReady? "Pret" : "Pas pret")}
              <Button variant="danger" size="sm" disabled={player.username === sessionStorage.getItem('name') || clobby.owner !== sessionStorage.getItem('name')} onClick={() => handleKickPlayer(index)}>
                Kick
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="d-flex justify-content-between mt-4">
          <Button variant="success" size="lg" onClick={handleReadyClick}>
            Ready
          </Button>
          <Button variant="success" size="lg" onClick={handleStart} disabled={clobby.owner !== sessionStorage.getItem('name')}>
            Start
          </Button>
          <Button variant="secondary" size="lg" onClick={handleDisconnectClick}>
            Déconnexion
          </Button>
        </div>
      </div>
      <div className="text-white">
        <h2 className="text-center mb-4">Infos</h2>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre maximal de joueurs</Form.Label>
            <Form.Control
              type="number"
              value={maxPlayers}
              disabled={clobby.owner !== sessionStorage.getItem('name')}
              onChange={(e) => setPlayer(e.target.value)}
              className="rounded-pill"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Temps entre les tours (s)</Form.Label>
            <Form.Control
              type="number"
              value={timeBetweenTurn}
              disabled={clobby.owner !== sessionStorage.getItem('name')}
              onChange={(e) => setTimeTurn(e.target.value)}
              className="rounded-pill"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nombre maximal de rounds</Form.Label>
            <Form.Control
              type="number"
              value={roundsMax}
              disabled={clobby.owner !== sessionStorage.getItem('name')}
              onChange={(e) => setRound(e.target.value)}
              className="rounded-pill"
            />
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export default Lobby;
