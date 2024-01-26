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
  const [opponents, setOpponents] = useState([
    { name: 'Joueur 1', deck: [1, 2, 3] },
    { name: 'Joueur 2', deck: [5, 6, 7] },
    { name: 'Joueur 3', deck: [1, 2, 5] },
    { name: 'Joueur 4', deck: [1, 2, 5] },
    { name: 'Joueur 5', deck: [1, 2, 5] },
    { name: 'Joueur 6', deck: [1, 2, 5] },
    { name: 'Joueur 7', deck: [1, 2, 5] },
    { name: 'Joueur 8', deck: [1, 2, 5] },
    { name: 'Joueur 9', deck: [1, 2, 5] },
  ]);

  const supprimerElement = (index, list) => {
    const nouvelleList = [...list];
    nouvelleList.splice(index, 1);
    setPlayerCards(nouvelleList);
  };


  const selectCardClick = (card) => {

    socket.emit('askGameInfo', sessionStorage.getItem('serverConnected'));

    
    if (!isCardSelected && myTurn) {
      setSelectedCard(card);
      setCardInWaiting([...cardInWaiting, selectedCard]);
      console.log(cardInWaiting);
      setIsCarteSelected(true);
      supprimerElement(playerCards.indexOf(card.card), playerCards)
    }
  };

  const Carte = (card, index) => {
    return (
        <div key={index} className="card" onClick={() => selectCardClick(card)}>
           <img alt='' src= {cartes[card.card.number-1]}></img>
        </div>
    );
};

  const WaitingCards = () => {
    return (
      <div className="card" >
        <img alt='' src={backCard}></img>
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
        {box1Container.map((card, index) => (
        card != null && (
          <Carte
            key={index}
            card={card}
            index={index}
          ></Carte>)
        ))}
      </div>
    );
  };

  const Rectangle1 = () => {
    return <div className='rectangle' onClick={() => addCard2()}>
      {box2Container.map((card, index) => (
        card != null && (
          <Carte
            key={index}
            card={card}
            index={index}
          ></Carte>)
      ))}
    </div>
  }
  const Rectangle2 = () => {
    return <div className='rectangle' onClick={() => addCard3()}>
      {box3Container.map((card, index) => (
        card != null && (
          <Carte
            key={index}
            card={card}
            index={index}
          ></Carte>)
      ))}
    </div>
  }
  const Rectangle3 = () => {
    return <div className='rectangle' onClick={() => addCard4()}>
      {box4Container.map((card, index) => (
        card != null && (
          <Carte
            key={index}
            card={card}
            index={index}
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
      
      console.log(rowL);
      setBox1Container(rowL[0]);
      setBox2Container(rowL[1]);
      setBox3Container(rowL[2]);
      setBox4Container(rowL[3]);

    });

    socket.on('6oppo',(oppo) => {

      setOpponents(oppo);

      oppo.forEach(element => {
        
        if(element.nom === sessionStorage.getItem("name")){

          setScore(element.score);

        }

      });

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
  }, []);




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
        {cardInWaiting.map((card, index) => (
          <WaitingCards
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
          {playerCards.map((card, index) => (
            <Carte
              key={index}
              card={card}
              index={index}
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