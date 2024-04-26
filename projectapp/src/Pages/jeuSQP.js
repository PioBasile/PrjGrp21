import React, { useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [box1Container, setBox1Container] = useState([{ number: 1 }]);
  const [box2Container, setBox2Container] = useState([{ number: 2 }]);
  const [box3Container, setBox3Container] = useState([{ number: 3 }]);
  const [box4Container, setBox4Container] = useState([{ number: 4 }]);
  const [cardInWaiting, setCardInWaiting] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [selected, setselected] = useState(false);

  const [score, setScore] = useState(0);
  const [opponents, setOpponents] = useState([]);
  const [visibleCard, setVisibleCard] = useState("");

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [owner, setOwner] = useState("");
  const [myTurn, setMyTurn] = useState(true);

  const [allPlayerSelected, setAllPlayerSelected] = useState(false);
  const [myTurnP2, setMyTurnP2] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [playerPlaying, setPlayerPlaying] = useState("")
  const [isSave, setIsSave] = useState(false);
  const [playerNameEmote, setPlayerNameEmote] = useState("");
  const [EmoteToShow, setEmoteToShow] = useState("");
  const emoteRef = useRef(null); // Référence à la div de l'emote
  const [showEmotes, setShowEmotes] = useState(false);
  const emoteBubbleRef = useRef(null);

  const [bots, setBots] = useState(
    [
        { imageUrl: require("./CSS/pics/mathis.webp"), username: "Mathis", level: 1, geoDash: require("./CSS/pics/Easy.webp") },
        { imageUrl: require("./CSS/pics/obama.webp"), username: "Obamna", level: 20, geoDash: require("./CSS/pics/Normal.webp") },
        { imageUrl: require("./CSS/pics/trump (1).jpg"), username: "Donald Trump", level: 530, geoDash: require("./CSS/pics/Harder.webp") },
        { imageUrl: require("./CSS/pics/JFK.PNG"), username: "JFK", level: "Impossible", geoDash: require("./CSS/pics/Insane.webp") },
        { imageUrl: require("./CSS/pics/bush.JPG"), username: "George In Bush", level: "GOOD TIER", geoDash: require("./CSS/pics/Insane.webp") },
        { imageUrl: require("./CSS/pics/biden (1).jpg"), username: "Sleepy Joe", level: 9999, geoDash: require("./CSS/pics/ExtremeDemon.webp") },
        
    ]
);

    const getBotData = (username) => {
      return bots.find(bot => {
        const baseName = bot.username.toLowerCase();
        const simplifiedUsername = username.replace(/\(\d+\)$/, "").trim().toLowerCase();
        return baseName === simplifiedUsername;
      });
    };

    const isBot = (username) => {
      return Boolean(getBotData(username));
    };

  
  

  const videoToPlay = [
    { id: 1, videoUrl: require("./CSS/emotes/toyota.mp4") },
    { id: 2, videoUrl: require("./CSS/emotes/BOING.mp4") },
    { id: 3, videoUrl: require("./CSS/emotes/hampter.mp4") },
    { id: 4, videoUrl: require("./CSS/emotes/MissInput.mp4") },
    { id: 5, videoUrl: require("./CSS/emotes/PutinMEWING.mp4") },
    { id: 6, videoUrl: require("./CSS/emotes/KillUrSelf.mp4") },
    { id: 7, videoUrl: require("./CSS/emotes/horse.mp4") },
    { id: 8, videoUrl: require("./CSS/emotes/holy.mp4") },
    { id: 9, videoUrl: require("./CSS/emotes/holy.mp4") },
    { id: 10, videoUrl: require("./CSS/emotes/freddy.mp4") },
    { id: 11, videoUrl: require("./CSS/emotes/NuhUh.mp4") },
    { id: 12, videoUrl: require("./CSS/emotes/hellnaw.mp4") },
    { id: 13, videoUrl: require("./CSS/emotes/hogRider.mp4") },
    { id: 14, videoUrl: require("./CSS/emotes/josh.mp4") },
    { id: 15, videoUrl: require("./CSS/emotes/quandale.mp4") },
    { id: 16, videoUrl: require("./CSS/emotes/mao.mp4") },
    { id: 17, videoUrl: require("./CSS/emotes/bible.mp4") },
    { id: 18, videoUrl: require("./CSS/emotes/spiderman.mp4") },
    { id: 19, videoUrl: require("./CSS/emotes/goku.mp4") },
    { id: 20, videoUrl: require("./CSS/emotes/gatorade.mp4") },
    { id: 21, videoUrl: require("./CSS/emotes/dj.mp4") },
    { id: 22, videoUrl: require("./CSS/emotes/jumpascare.mp4") },
    { id: 23, videoUrl: require("./CSS/emotes/godofwar.mp4") },
    { id: 24, videoUrl: require("./CSS/emotes/honoredone.mp4") },
    { id: 25, videoUrl: require("./CSS/emotes/imfinished.mp4") },
    { id: 26, videoUrl: require("./CSS/emotes/navire.mp4") },
    { id: 27, videoUrl: require("./CSS/emotes/waaaa.mp4") },
    { id: 28, videoUrl: require("./CSS/emotes/uaremysunshine.mp4") },
]


  const [videos, setVideos] = useState([
    { id: 1, videoUrl: require("./CSS/emotes/toyota.mp4") },
    { id: 2, videoUrl: require("./CSS/emotes/BOING.mp4") },
    { id: 3, videoUrl: require("./CSS/emotes/hampter.mp4") },
    { id: 4, videoUrl: require("./CSS/emotes/MissInput.mp4") },
    { id: 5, videoUrl: require("./CSS/emotes/PutinMEWING.mp4") },
    { id: 6, videoUrl: require("./CSS/emotes/KillUrSelf.mp4") },
    { id: 7, videoUrl: require("./CSS/emotes/horse.mp4") },
    { id: 8, videoUrl: require("./CSS/emotes/holy.mp4") },
    { id: 9, videoUrl: require("./CSS/emotes/holy.mp4") },
    { id: 10, videoUrl: require("./CSS/emotes/freddy.mp4") },
    { id: 11, videoUrl: require("./CSS/emotes/NuhUh.mp4") },
    { id: 12, videoUrl: require("./CSS/emotes/hellnaw.mp4") },
    { id: 13, videoUrl: require("./CSS/emotes/hogRider.mp4") },
    { id: 14, videoUrl: require("./CSS/emotes/josh.mp4") },
    { id: 15, videoUrl: require("./CSS/emotes/quandale.mp4") },
    { id: 16, videoUrl: require("./CSS/emotes/mao.mp4") },
    { id: 17, videoUrl: require("./CSS/emotes/bible.mp4") },
    { id: 18, videoUrl: require("./CSS/emotes/spiderman.mp4") },
    { id: 19, videoUrl: require("./CSS/emotes/goku.mp4") },
    { id: 20, videoUrl: require("./CSS/emotes/gatorade.mp4") },
    { id: 21, videoUrl: require("./CSS/emotes/dj.mp4") },
    { id: 22, videoUrl: require("./CSS/emotes/jumpascare.mp4") },
    { id: 23, videoUrl: require("./CSS/emotes/godofwar.mp4") },
    { id: 24, videoUrl: require("./CSS/emotes/honoredone.mp4") },
    { id: 25, videoUrl: require("./CSS/emotes/imfinished.mp4") },
    { id: 26, videoUrl: require("./CSS/emotes/navire.mp4") },
    { id: 27, videoUrl: require("./CSS/emotes/waaaa.mp4") },
    { id: 28, videoUrl: require("./CSS/emotes/uaremysunshine.mp4") },
]);


  function playEmote(emoteUrl) {
    socket.emit('sendEmoteToLobby', { emote: emoteUrl.id, playerName: sessionStorage.getItem('name'), serverId: sessionStorage.getItem('serverConnected') });
  }

  const toggleEmotes = () => {
    setShowEmotes(!showEmotes);
  };


  const selectCardClick = (payload) => {

    if (!myTurn) { return 0 };
    let card = payload.card

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
      <div className="card-sqp" >
        <img alt='' src={source}></img>
      </div>)
  }


  const addCard = () => {

    if (!myTurnP2) { return 0 }


    socket.emit('send6cardphase2', 1, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));

  }


  const addCard2 = () => {

    if (!myTurnP2) { return 0 }

    socket.emit('send6cardphase2', 2, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));

  }

  const addCard3 = () => {

    if (!myTurnP2) { return 0 }

    socket.emit('send6cardphase2', 3, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));

  }

  const addCard4 = () => {

    if (!myTurnP2) { return 0 }

    socket.emit('send6cardphase2', 4, sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));

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
      socket.emit("loadTheChat", sessionStorage.getItem("serverConnected"));
      socket.emit("whaIsOwner", sessionStorage.getItem("serverConnected"));
      socket.emit("whatsMyEmotes", sessionStorage.getItem("name"));

    }

    return () => {
      mounted = false;
    }
  }, [navigate])

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (emoteBubbleRef.current && !emoteBubbleRef.current.contains(event.target)) {
            // socket.emit("endEmote", SERVER_ID);
            setShowEmotes(false);
        }
    };

    if (showEmotes) {
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [showEmotes]);


  useEffect(() => {

    let mounted = true;
    let failed = false;

    if (sessionStorage.getItem("name") == null || sessionStorage.getItem("serverConnected") == null) {
      navigate("/login-signup");
      failed = true;
    }
    if (mounted && !failed) {


      socket.on("owner", (owner) => {
        console.log(owner)
        setOwner(owner)
      })

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
        let oppoWithoutMe = oppo.filter(opponent => opponent.nom !== sessionStorage.getItem("name"))
        setOpponents(oppoWithoutMe);

        oppo.forEach(element => {

          if (element.nom === sessionStorage.getItem("name")) {

            setScore(element.score);

          }

        });

      });
      socket.on('cartesDroite', (cards) => {

        setCardInWaiting(cards);
        console.log(cards);

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
          socket.emit("thisIsThePlayerWhoPlayed", sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected"));

        } else {

          setMyTurnP2(false);
        }

      });
      socket.on('FIN', (winner) => {


        sessionStorage.setItem('winners', JSON.parse(JSON.stringify(winner)).name);
        navigate("/winner");

      });

      socket.on("deco", (name) => {

        navigate("/BrowserManager");

      });

      socket.on('timerDown', () => {
        
        setSeconds(prevSeconds => {
          if (prevSeconds === 0 || !myTurn) {

            try {

              let t = deckmem.length;

            } catch {

              deckmem = playerCards;
              console.log(deckmem);

            }

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


      socket.on("botCard", (carteDroites) => {
        setTimeout(() => {
          setCardInWaiting(carteDroites);
        },"3000");
      })

      socket.on("emote", (emote, opponentName) => {

        let video = 0;
        videoToPlay.forEach((videos) => {

            if (videos.id === emote) {
                video = videos;
            }

        });
        if (video === 0) {
            return;
        }

        setEmoteToShow(video.videoUrl);
        setPlayerNameEmote(opponentName);
    });

    socket.on("endEmoteToAll", () => {
      setPlayerNameEmote("");
    })

    socket.on("yourEmotes", (emotesList) => {
      if(emotesList != null){
          const videoFilter = videos.filter(video => {
              return emotesList.some(video2 => video2 === video.id);
              
          });
          setVideos(videoFilter);
      }
      else{
          setVideos([]);
      }
    })

    socket.on("getMessage", (msgList) => {
        setMessages(msgList);
    })

      socket.on("playerWhosPlaying", (playerName) => {

        setPlayerPlaying(playerName);
      });

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
      socket.off("emote");
      socket.off("endEmoteToAll"); 
    };
  }, [isVisible, navigate, myTurn, selected,videos,showEmotes,playerNameEmote,EmoteToShow]);

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
    setIsSave(false);
    socket.emit("saveGame", sessionStorage.getItem("serverConnected"),saveName, sessionStorage.getItem("name"))
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

  const openSavePopUp = () => {
    setIsSave(true);
  }

  const leave = () => {
    socket.emit("SQP-leaveGame", sessionStorage.getItem("name"), sessionStorage.getItem("serverConnected") );
    socket.emit('leave', sessionStorage.getItem('serverConnected'));
    navigate('/BrowserManager');
  }


  useEffect(() => {
    const messageContainer = document.querySelector('.sqp-message-container');
    if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]); 

  function closePopup() {
    setIsSave(false);
  }


  return (


    <div className="six-container">


      {/* UPPER BANDEAU */}
      <button className="bo-emote-button" onClick={toggleEmotes}>Emotes</button>
      {isSave && (
          <div className='savePopUp'>
              <div className='closeButton' onClick={() => closePopup()}>X</div>
              <h1 className='titlePopUp'>Entrer le nom de la sauvegarde :</h1>
              <input className="inputPopup" type="text" placeholder='Nom de la sauvegarde' onChange={(e) => setSaveName(e.target.value)}></input>
              <div className="saveButtonPopUp" onClick={() => saveGame()}>Sauvegarder</div>
          </div>
      )}

    
      <div className='sqp-upperBandeau'>

        <YourComponent></YourComponent>

        <div className="adverse-players">
        {opponents.map((opponent, index) => {
            const botData = getBotData(opponent.nom);
            return (
                <div key={index} className={`opponent-six ${botData ? 'bot-opponent-six' : ''}`}>
                    {botData && (
                        <img src={botData.imageUrl} alt={opponent.nom} className="bot-image" />
                    )}
                    <strong>{opponent.nom}</strong><br />
                    Cartes: {opponent.deck}<br />
                </div>
            );
        })}
      </div>


      </div>


      <div className='sqp-gameContainer'>
        
        {/* Game table section */}
        <div className="rectangle-container">
          <Rectangle></Rectangle>
          <Rectangle1></Rectangle1>
          <Rectangle2></Rectangle2>
          <Rectangle3></Rectangle3>
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

      </div>

      {/* Joueur cards en bas */}
      <div className='sqp-cardContianer'>
        
      <div className='sqp-exit-button' onClick={leave}> QUITTER</div>
        {owner === sessionStorage.getItem("name") && <div className='sqp-save-button' onClick={() => openSavePopUp()}> Sauvergarder</div>}
        
        <div className="sqp-emote-container">
                <button className="sqp-emote-button" onClick={toggleEmotes}>Emotes</button>
                {showEmotes && (
                    <div className="sqp-emote-bubble" ref={emoteBubbleRef}>
                        <div className="sqp-emote-list">
                            {videos.map((emote, index) => (
                                <div key={index} className="sqp-emote" onClick={() => playEmote(emote)}>
                                    <video src={emote.videoUrl}  />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
          </div>

          <div className="sqp-emote-display-container">
            <h2 className="sqp-emote-display-title">Dernière Emote Jouée est de </h2>
            <div className='sqp-player-emote-container' ref={emoteRef}>
                <div className="sqp-emoteplayer-name">{playerNameEmote} :</div>
                <div className="sqp-player-emote">
                    <video src={EmoteToShow} autoPlay />
                </div>
            </div>
          </div>


    


        <div className='sqp-timer'>
          <p>Encore {seconds}s </p>
        </div>
        <div className={(myTurnP2 || !allPlayerSelected) ? 'sqp-card-holder' : 'sqp-card-holderNYT'} >
          <div className={"notYourTurn-cards"} >
            {playerCards.map((card) => (
              <div className="sqp-card">
              <Carte
                key={card.number}
                card={card}
              ></Carte>
            </div>
            ))}
          </div>
        </div>

        
        <div className={`scoreboard ${isVisible ? 'visible' : ''}`}>
          <div className="scoreboard-tab">Appuez sur Tab</div>
          <div className="scoreboard-content">
            <strong>Votre</strong> score: {score} <br />
            {opponents.map((opponent, index) => (
              <div key={index}>
                <strong>{opponent.nom}</strong>'s
                score: {opponent.score} <br />
              </div>
            ))}

          </div>
        </div>
      </div>


      <div className="chat-container" id='chatContainer'>
        <div className='message-container sqp-message-container' >
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
