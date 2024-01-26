import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG';
import './CSS/jeuSQP.css'
import backCard from './CSS/sqpBack.jpg'



const SixQuiPrend = () => {
  const cartes = [];

  for (let i = 1; i <= 104; i++) {
    const cheminImage = require(`./CSS/cartes6/${i}.svg`);
    cartes.push(cheminImage);
  }
  const [selectedCard, setSelectedCard] = useState(null);
  //eslint-disable-next-line
  //eslint-disable-next-line
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(10);
  //eslint-disable-next-line
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [box1Container, setBox1Container] = useState([{ number: 1 }]);
  const [box2Container, setBox2Container] = useState([{ number: 2 }]);
  const [box3Container, setBox3Container] = useState([{ number: 3 }]);
  const [box4Container, setBox4Container] = useState([{ number: 4 }]);
  const [cardInWaiting, setCardInWaiting] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [isCardSelected, setIsCarteSelected] = useState(false);
  //eslint-disable-next-line
  const [score, setScore] = useState(0);
  const [myTurn, setMyTurn] = useState(true);
  const [opponents, setOpponents] = useState([]);
  const [visibleCard, setVisibleCard] = useState("");

  const supprimerElement = (index, list) => {
    const nouvelleList = [...list];
    nouvelleList.splice(index, 1);
    setPlayerCards(nouvelleList);
  };


  const selectCardClick = (payload) => {

    if(!myTurn){return 0};

    let card = payload.card
    socket.emit('send6cardphase1', card, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));
    setVisibleCard(card);
  
  };

  const Carte = (payload) => {
    return (
        <div key={payload.number} className="card" onClick={() => selectCardClick(payload)}>
           <img alt='' src= {cartes[payload.card.number-1]}></img>
        </div>
    );
};

  const WaitingCards = (props) => {

    let card = props.card;
    let source;

    if(card.number === visibleCard.number){

      source = cartes[card.number-1];

    }else {

      source = backCard;

    }

    return (
      <div className="card" >
        <img alt='' src={source}></img>
      </div>)
  }


  const addCard = () => {
    if (box1Container.length < 5 && myTurn) {
      if (selectedCard != null) {
        if(selectedCard.card.number > box1Container[box1Container.length -1].number ) {
          setBox1Container([...box1Container, selectedCard.card])
        }
        else {
          setBox1Container([selectedCard.card]);
        }
      }
    }
    else {
      if (selectedCard != null && myTurn) {
        setBox1Container([selectedCard.card]);
      }
    }
    // setMyTurn(false);
    cardInWaiting.pop();
    setIsCarteSelected(false);
  }


  const addCard2 = () => {
    if (box2Container.length < 5) {
      if (selectedCard != null && myTurn ) {
        if (selectedCard.card.number > box2Container[box2Container.length-1].number ) {
          setBox2Container([...box2Container, selectedCard.card])
        }
        else {
          setBox2Container([selectedCard.card]);
        }
      }
    }
    else {
      if (selectedCard != null && myTurn) {
        setBox2Container([selectedCard.card]);
      }
    }
    setMyTurn(false);
    setIsCarteSelected(false);
    cardInWaiting.pop();
  }

  const addCard3 = () => {
    if (box3Container.length < 5) {
      if (selectedCard != null && myTurn) {
        if (selectedCard.card.number > box3Container[box3Container.length-1].number ) {
          setBox3Container([...box3Container, selectedCard.card])
        }
        else {
          setBox3Container([selectedCard.card]);
        }
      }
    }
    else {
      if (selectedCard != null && myTurn) {

        setBox3Container([selectedCard.card]);
      }

    }
    setMyTurn(false);
    setIsCarteSelected(false);
    cardInWaiting.pop();
  }

  const addCard4 = () => {
    if (box4Container.length < 5) {
      if (selectedCard != null && myTurn) {
        if (selectedCard.card.number > box4Container[box4Container.length-1].number) {
          setBox4Container([...box4Container, selectedCard.card])
        }
        else {
          setBox4Container([selectedCard.card]);
        }
      }
    }
    else {
      if (selectedCard != null && myTurn) {
        setBox4Container([selectedCard.card]);
      }

    }
    setMyTurn(false);
    cardInWaiting.pop();
    setIsCarteSelected(false);
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

  // Effet pour gérer le timer
  useEffect(() => {
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (!isActive && seconds !== 0 && seconds < 60) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {


    socket.emit('6update', sessionStorage.getItem('name'), sessionStorage.getItem('serverConnected'));

    // GESTION stabilité de la connection
    socket.emit("co", sessionStorage.getItem("name"), sessionStorage.getItem("connection_cookie"))
    socket.emit("getServ");
    socket.emit('join',sessionStorage.getItem('serverConnected'));

    //socket.on('getMessage', (msg) => {
    //    console.log("msg : ", msg);
    //    setMessages((prevMessages) => [...prevMessages, msg]);
    //});

  }, [])

  useEffect(() => {

    
    socket.on("Deck", (deck) => {
      setPlayerCards(deck);
    });

    socket.on('Row',(rowL) => {

      setBox1Container(rowL[0]);
      setBox2Container(rowL[1]);
      setBox3Container(rowL[2]);
      setBox4Container(rowL[3]);
      //setCardInWaiting(rowL[3]);

    });

    socket.on('6oppo',(oppo) => {

      setOpponents(oppo);

      oppo.forEach(element => {
        
        if(element.nom === sessionStorage.getItem("name")){

          setScore(element.score);

        }

      });

    });


    socket.on('cartesDroite', (cards) => {

      setCardInWaiting(cards);

    });


    socket.on('phase2', () => {

      setMyTurn(false);

    });






    // TAB 
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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isVisible]);




  return (
    <div className="six-container">


      <div className="adverse-players">
        {opponents.map((opponent, index) => (
          <div key={index} className="opponent-six">
            <strong>{opponent.nom}</strong> <br />
            Cards: {opponent.deck} <br />
            Score: {opponent.score}
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
      <div className='card-holder' >
        <div className={myTurn ? "player-cards":"notYourTurn-cards"} >
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
          {/* Contenu du scoreboard ici */}
          My Score:  {score}<br />
          Number of Cards: {playerCards.length}
        </div>
      </div>
    </div>
  );
}

export default SixQuiPrend;