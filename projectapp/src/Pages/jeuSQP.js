import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import socket from '../socketG';
import './CSS/jeuSQP.css'
import backCard from './CSS/pics/sqpBack.jpg'




const SixQuiPrend = () => {
  const cartes = [];

  for (let i = 1; i <= 104; i++) {
    const cheminImage = require(`./CSS/svgs/cartes6/${i}.svg`);
    cartes.push(cheminImage);
  }
  //eslint-disable-next-line
  //eslint-disable-next-line
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(30);
  //eslint-disable-next-line
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [box1Container, setBox1Container] = useState([{ number: 1 }]);
  const [box2Container, setBox2Container] = useState([{ number: 2 }]);
  const [box3Container, setBox3Container] = useState([{ number: 3 }]);
  const [box4Container, setBox4Container] = useState([{ number: 4 }]);
  const [cardInWaiting, setCardInWaiting] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [selected, setselected] = useState(false);
  //eslint-disable-next-line
  const [score, setScore] = useState(0);
  const [opponents, setOpponents] = useState([]);
  const [visibleCard, setVisibleCard] = useState("");

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const [myTurn, setMyTurn] = useState(true);

  const [allPlayerSelected, setAllPlayerSelected] = useState(false);
  const [myTurnP2, setMyTurnP2] = useState(false);


  const selectCardClick = (payload) => {

    if (!myTurn) { return 0 };
    let card = payload.card
    console.log('test');



    socket.emit('send6cardphase1', card, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));
    setVisibleCard(card);
    setselected(true);
    sessionStorage.setItem('visibleCard', JSON.stringify(card));

  };

  const Carte = (payload) => {

    const isClickable = !(box1Container.includes(payload.card) || box2Container.includes(payload.card) || box3Container.includes(payload.card) || box4Container.includes(payload.card));

    return (
      <div key={payload.number} className="card" onClick={isClickable ? () => selectCardClick(payload) : null}>
        <img alt='' src={cartes[payload.card.number - 1]}></img>
      </div>
    );
  };

  const WaitingCards = (props) => {

    let card = props.card;
    let source;

    if (card.number === visibleCard.number || sessionStorage.getItem('visibleCard') === JSON.stringify(card) || !myTurn) {

      source = cartes[card.number - 1];

    } else {

      source = backCard;

    }

    return (
      <div className="card" >
        <img alt='' src={source}></img>
      </div>)
  }


  const addCard = () => {

    if (!myTurnP2) { return 0 }


    socket.emit('send6cardphase2', 1, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));

    console.log("1");
  }


  const addCard2 = () => {

    if (!myTurnP2) { return 0 }

    socket.emit('send6cardphase2', 2, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));

    console.log("2");
  }

  const addCard3 = () => {

    if (!myTurnP2) { return 0 }

    socket.emit('send6cardphase2', 3, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));

    console.log("3");
  }

  const addCard4 = () => {

    if (!myTurnP2) { return 0 }

    socket.emit('send6cardphase2', 4, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));

    console.log("4");
  }

  const Rectangle = () => {
    return (
      <div className='rectangle' onClick={() => addCard()}>
        {box1Container.map((card) => (
          card != null && (
            <Carte
              key={card.number}
              card={card}
            ></Carte>)
        ))}
      </div>
    );
  };

  const Rectangle1 = () => {
    return <div className='rectangle' onClick={() => addCard2()}>
      {box2Container.map((card) => (
        card != null && (
          <Carte
            key={card.number}
            card={card}
          ></Carte>)
      ))}
    </div>
  }
  const Rectangle2 = () => {
    return <div className='rectangle' onClick={() => addCard3()}>
      {box3Container.map((card) => (
        card != null && (
          <Carte
            key={card.number}
            card={card}
          ></Carte>)
      ))}
    </div>
  }
  const Rectangle3 = () => {
    return <div className='rectangle' onClick={() => addCard4()}>
      {box4Container.map((card) => (
        card != null && (
          <Carte
            key={card.number}
            card={card}
          ></Carte>)
      ))}
    </div>
  }







  useEffect(() => {

    let mounted = true;
    let failed = false;

    if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected") == null) {
      navigate("/login-signup");
      failed = true;
    }
    if (mounted && !failed) {

      socket.emit('join', sessionStorage.getItem('serverConnected'));
      socket.emit('6update', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));
      socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"))
    }

    return () => {
      mounted = false;
    }
  }, [navigate])


  useEffect(() => {

    let mounted = true;
    let failed = false;

    if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected") == null) {
      navigate("/login-signup");
      failed = true;
    }
    if (mounted && !failed) {

      let deckmem;
      socket.on("Deck", (deck) => {
        setPlayerCards(deck);
        deckmem = deck;
      });
      socket.on('Row', (rowL) => {

        setBox1Container(rowL[0]);
        setBox2Container(rowL[1]);
        setBox3Container(rowL[2]);
        setBox4Container(rowL[3]);

      });
      socket.on('6oppo', (oppo) => {

        setOpponents(oppo);

        oppo.forEach(element => {

          if (element.nom === sessionStorage.getItem("name")) {

            setScore(element.score);

          }

        });

      });
      socket.on('cartesDroite', (cards) => {

        setCardInWaiting(cards);

      });
      socket.on('phase2', () => {
        setMyTurn(false);
        setAllPlayerSelected(true);

      });
      socket.on('phase1', () => {
        setAllPlayerSelected(false);
        setMyTurn(true);
        setMyTurnP2(false);
        setselected(false);
        socket.emit('6update', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));

      });
      socket.on("nextPlayer", (payload) => {

        if (payload.name === sessionStorage.getItem('name')) {

          setMyTurnP2(true);

        } else {

          setMyTurnP2(false);
        }

      });
      socket.on('FIN', (winner) => {

        console.log(JSON.parse(JSON.stringify(winner)).name);
        sessionStorage.setItem('winners', JSON.parse(JSON.stringify(winner)).name);
        navigate("/winner");

      });

      socket.on("deco", (name) => {

        navigate("/login-signup");

      });

      socket.on('timerDown', () => {



        setSeconds(prevSeconds => {
          if (prevSeconds === 0 || !myTurn) {
            if (myTurn && !selected) {
              setselected(true);
              socket.emit('send6cardphase1', deckmem[Math.floor(Math.random() * deckmem.length)], sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));
            }
            return 30;
          } else {
            return prevSeconds - 1;
          }

        });
      });

      socket.on("getMessage", (msgList) => {
        setMessages(msgList);
      })

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }
    return () => {
      mounted = false;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      socket.off('timerDown');
      socket.off('Deck');
      socket.off('Row');
      socket.off('6oppo');
      socket.off('cartesDroite');
      socket.off('phase2');
      socket.off('phase1');
      socket.off('FIN');
      socket.off('nextPlayer');
      socket.off("getMessage")
    };
  }, [isVisible, navigate, myTurn, selected]);

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Empêche le comportement par défaut de la touche Tab
      setIsVisible(true);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Tab") {
      setIsVisible(false);
    }
  };

  const sendMessage = () => {
    socket.emit('sendMessage', { name: sessionStorage.getItem("name"), msg: message, serverId: sessionStorage.getItem("serverConnected") });
    setMessage('');
  }

  const saveGame = () => {
    socket.emit("saveGame", sessionStorage.getItem("serverConnected"), sessionStorage.getItem("name"))
  }


  function YourComponent() {
    useEffect(() => {
      let chatContainer = document.getElementById("chatContainer");
      if (chatContainer == null) { return 0; }

      function getElementId(event) {
        var clickedElementId = event.target.id;
        if (clickedElementId === "inputChat") {
          chatContainer.style.opacity = 1;
        } else {
          chatContainer.style.opacity = 0.33;
        }
        return clickedElementId;
      }

      function sendMessageOnEnter(event) {
        if (event.key === "Enter") {
          sendMessage();
        }
      }

      try {

        document.addEventListener('click', getElementId);
        document.getElementById("inputChat").addEventListener('keydown', sendMessageOnEnter);

      } catch (err) {

        console.log("meh");

      }

      return () => {

        try {

          document.removeEventListener('click', getElementId);
          document.getElementById("inputChat").removeEventListener('keydown', sendMessageOnEnter);

        } catch (err) {

          console.log("meh");

        }


      };

    }, []);

    return (
      <div></div>
    );
  }
  return (
    <div className="six-container">

      <div className='' onClick={() => saveGame()}> SAVE</div>

      <YourComponent></YourComponent>

      <div className='timer'>
        <p>{seconds}</p>
      </div>


      <div className="adverse-players">
        {opponents.map((opponent, index) => (
          <div key={index} className="opponent-six">
            <strong>{opponent.nom}</strong> <br />
            Cards: {opponent.deck} <br />
          </div>
        ))}
      </div>


      <div className="waitingCards">
        {cardInWaiting.map((card) => (
          <WaitingCards
            key={card.number}
            card={card}
          >
          </WaitingCards>
        ))}
      </div>

      {/* Game table section */}
      <div className="rectangle-container">
        <Rectangle></Rectangle>
        <Rectangle1></Rectangle1>
        <Rectangle2></Rectangle2>
        <Rectangle3></Rectangle3>
      </div>

      {/* Joueur cards en bas */}
      <div className={(myTurnP2 || !allPlayerSelected) ? 'card-holder' : 'card-holderNYT'} >
        <div className={myTurn ? "player-cards" : "notYourTurn-cards"} >
          {playerCards.map((card) => (
            <Carte
              key={card.number}
              card={card}
            ></Carte>
          ))}
        </div>
      </div>
      {/* Scoreboard on the side */}
      <div className={`scoreboard ${isVisible ? 'visible' : ''}`}>
        <div className="scoreboard-tab">Scoreboard</div>
        <div className="scoreboard-content">
          {opponents.map((opponent, index) => (
            <div key={index}>
              <strong>{opponent.nom}</strong>'s
              score: {opponent.score} <br />
            </div>
          ))}

        </div>
      </div>

      <div className="chat-container" id='chatContainer'>
        <div className='message-container bo-message-container' >
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>)
          )}
          <input
            id="inputChat"
            className='inputMessage'
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
          />
        </div>

      </div>
    </div>
  );
}

export default SixQuiPrend;