import React, { useEffect, useState } from 'react';
import './CSS/LobbyStyleSheet.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, ListGroup, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG';
import dino from './dino.js';


const Lobby = () => {

  socket.emit('join', sessionStorage.getItem('serverConnected'));
  sessionStorage.setItem('loaded', false);
  const [playerList, setPlayerList] = useState([]);
  const [maxPlayers, setMaxPlayers] = useState(10);
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

      if(sessionStorage.getItem("name") === name){
        navigate('/BrowserManager');

      }

    });

    socket.on("start", (place) => {

      navigate(`/${place}`);

    });


    return () => { mounted = false };

  }, [clobby.owner, navigate]);

  //-----------------DINO-----------------

  // const DinoGame = () => {
  //   useEffect(() => {
  //     const script = document.createElement('script');
  //     script.src = dino;
  //     script.async = true;
  //     document.body.appendChild(script);
  
  //     return () => {
  //       document.body.removeChild(script);
  //     };
  //   }, []);
  // };


  return (
    <div className="lob-container">
      


      <div className="lob-left-panel">

        <div className="lob-top">
          <div className="lob-leave">
            <Button variant="secondary" size="lg" onClick={handleDisconnectClick}>
              LEAVE
            </Button>
          </div>

          <div className="lob-rounded-pill"> SERVER NAME + GAMETYPE </div>
        </div>
        
        <div className="lob-info-container">
          <h2 className="lob-title">Infos Sur La Partie</h2>
          <Form>
            <Form.Group className="lob-info">
              <Form.Label>Propriétaire</Form.Label>
              <Form.Control
                type='text'
                value={clobby.owner}
              >
              </Form.Control>
            </Form.Group> 
            <Form.Group className="lob-info">
              <Form.Label>Nombre maximal de joueurs</Form.Label>
              <Form.Control
                type="number"
                value={maxPlayers}
                disabled={clobby.owner !== sessionStorage.getItem('name')}
                onChange={(e) => setPlayer(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="lob-info">
              <Form.Label>Temps entre les tours (s)</Form.Label>
              <Form.Control
                type="number"
                value={timeBetweenTurn}
                disabled={clobby.owner !== sessionStorage.getItem('name')}
                onChange={(e) => setTimeTurn(e.target.value)}

              />
            </Form.Group>
            <Form.Group className="lob-info">
              <Form.Label>Nombre maximal de rounds</Form.Label>
              <Form.Control
                type="number"
                value={roundsMax}
                disabled={clobby.owner !== sessionStorage.getItem('name')}
                onChange={(e) => setRound(e.target.value)}
              
              />
            </Form.Group>
          </Form>

        </div>

        <title>Chrome Dinosaur Game</title>
        <div className="dino-body">
          <canvas id="board" width={1050}></canvas> 
          <dino/>
        </div>
       
      </div>

      <div className="lob-right-panel">

        <h2 className="lob-title-j">Joueurs</h2>
        <div className="lob-playerlist">
          <ListGroup>
            
              {playerList.map((player, index) => (
                <ListGroup.Item key={index} className="lob-playerlist">
                    {index + 1 + " "}
                     {player.username + " | " + (player.isReady ? "Pret" : "Pas pret")} 
                    <Button className="lobby-status" variant="danger" size="sm" disabled={player.username === sessionStorage.getItem('name') || clobby.owner !== sessionStorage.getItem('name')} onClick={() => handleKickPlayer(index)}>
                      Kick
                    </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
  
        </div>

        <div className="lob-boutton">
          <Button variant="success" size="lg" onClick={handleReadyClick}>
            Ready
          </Button>
          <Button variant="success" size="lg" onClick={handleStart} disabled={clobby.owner !== sessionStorage.getItem('name')}>
            Start
          </Button>
          
        </div>
      </div>




    </div>
  );
};

export default Lobby;
