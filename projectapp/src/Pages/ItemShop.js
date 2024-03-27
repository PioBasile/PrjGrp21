import React, { useState, useEffect } from 'react';
import socket from '../socketG';
import './CSS/ItemShop.css';
import stars from './CSS/vids/stars.mp4';
import { useNavigate } from 'react-router-dom';

const ItemShop = () => {
    const NAME = sessionStorage.getItem("name")
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [money, setMoney] = useState('0');
    const navigate = useNavigate();
    const [myEmotes, setMyEmotes] = useState([]);


    // --------------------------------- GIFS -----------------------------------

    const toyota = require("./CSS/emotes/toyota.mp4");
    const BOING = require("./CSS/emotes/BOING.mp4");
    const Hampter = require("./CSS/emotes/hampter.mp4");
    const MissInput = require("./CSS/emotes/MissInput.mp4");
    const PutinMewing = require("./CSS/emotes/PutinMEWING.mp4");
    const KillurSelf = require("./CSS/emotes/KillUrSelf.mp4");
    const horse = require("./CSS/emotes/horse.mp4");
    const bookies = require("./CSS/emotes/bookies.mp4");
    const holy = require("./CSS/emotes/holy.mp4");
    const freddy = require("./CSS/emotes/freddy.mp4");
    const NuhUh = require("./CSS/emotes/NuhUh.mp4");
    const hellnaw = require("./CSS/emotes/hellnaw.mp4");
    const hogRider = require("./CSS/emotes/hogRider.mp4");
    const josh = require("./CSS/emotes/josh.mp4");
    const quandale = require("./CSS/emotes/quandale.mp4");
    const mao = require("./CSS/emotes/mao.mp4");
    const bible = require("./CSS/emotes/bible.mp4");
    const spiderman = require("./CSS/emotes/spiderman.mp4");
    const goku = require("./CSS/emotes/goku.mp4");
    const gatorade = require("./CSS/emotes/gatorade.mp4");
    const dj = require("./CSS/emotes/dj.mp4");
    const jumpascare = require("./CSS/emotes/jumpascare.mp4");


    const gifs = [
        { id: 1, name: 'toyota     ', price: 100, location: toyota },
        { id: 2, name: 'BOING      ', price: 100, location: BOING },
        { id: 3, name: 'Hampter    ', price: 100, location: Hampter },
        { id: 4, name: 'MissInput  ', price: 100, location: MissInput },
        { id: 5, name: 'PutinMew', price: 100, location: PutinMewing },
        { id: 6, name: 'KilluSelf ', price: 100, location: KillurSelf },
        { id: 7, name: 'horse      ', price: 100, location: horse },
        { id: 8, name: 'bookies    ', price: 100, location: bookies },
        { id: 9, name: 'holy       ', price: 100, location: holy },
        { id: 10, name: 'freddy     ', price: 100, location: freddy },
        { id: 11, name: 'NuhUh      ', price: 100, location: NuhUh },
        { id: 12, name: 'hellnaw    ', price: 100, location: hellnaw },
        { id: 13, name: 'hogRider   ', price: 100, location: hogRider },
        { id: 14, name: 'josh       ', price: 100, location: josh },
        { id: 15, name: 'quandale   ', price: 100, location: quandale },
        { id: 16, name: 'mao        ', price: 100, location: mao },
        { id: 17, name: 'bible      ', price: 100, location: bible },
        { id: 18, name: 'spiderman  ', price: 100, location: spiderman },
        { id: 19, name: 'goku       ', price: 100, location: goku },
        { id: 20, name: 'gatorade   ', price: 100, location: gatorade },
        { id: 21, name: 'dj         ', price: 100, location: dj },
        { id: 22, name: 'jumpascare ', price: 100, location: jumpascare },
    ]

    const handleVideoClick = (event) => {
        const video = event.target;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
            video.currentTime = 0;
        }
    };

    const handleVideoEnd = (event) => {
        event.target.currentTime = 0;
    };


    // --------------------------------- PAGE MANIPULATION -----------------------------------

    // Calcul des items à afficher en fonction de la page actuelle
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = gifs.slice(indexOfFirstItem, indexOfLastItem);

    // changement de page
    const goToNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const goToPreviousPage = () => {
        setCurrentPage(prevPage => prevPage - 1);
    };

    // Désactivez le bouton Previous & Next 
    const lastPage = Math.ceil(gifs.length / itemsPerPage);

    //---------------------LEAVE-------------------------

    const leave = () => {
        navigate('/BrowserManager');
    }

    const buyItem = (gif) => {
        console.log("autantqueca");
        socket.emit("buyAGif", sessionStorage.getItem("name"), gif, money);
    }

    //-----------------------MONEY-------------------------

    useEffect(() => {
        socket.emit('askStat', sessionStorage.getItem("name"));
        socket.emit("whatsMyEmotes", sessionStorage.getItem("name"));
    },[]);


    useEffect(() => {

        socket.on("stats", (res) => {
            setMoney(res.argent);
        });

        socket.on("alreadyGot", () => {
            alert("Vous possedez déjà cette emote");
        })

        socket.on("noMoneyToBuyWompWomp", () => {
            alert("pas assez d'argent");
        })

        socket.on("yourEmotes", (emoteList) => {
            console.log("emotelist",emoteList)
            setMyEmotes(emoteList);
        })

        return () => {
            socket.off("stats");
            socket.off("alreadyGot");
            socket.off("noMoneyToBuyWompWomp");
        }
    }, []);

    const canBuy = (gifId) => {
        console.log(myEmotes);
        for (let emoteID of myEmotes) {
            if (gifId === emoteID) {
                return true;
            }
        }
        return false
    }


    return (
        <div className='item-shop-container'>

            <div className="is-background">
                <video src={stars} autoPlay loop muted onCanPlay={(event) => event.target.playbackRate = 0.75} />
            </div>

            <div className='item-shop-title'><h2> <strong> Le Item Shop </strong> </h2> </div>

            <div className='is-page'> Page {currentPage} sur {lastPage} </div>

            <div className="item-shop">
                {currentItems.map((gif) => (

                    <div key={gif.id} className="item-container buy">

                        <div className="is-item-info">
                            <div className="name-price-container">
                                <div className="is-gif-name">{gif.name}</div>
                                <div className="is-gif-price">{gif.price} $</div>
                            </div>

                            <div className="is-item">
                                <video src={gif.location} alt={gif.name} onClick={() => handleVideoClick()} onEnded={handleVideoEnd} />
                            </div>
                            <div className="separator-line"></div>
                            <button className={!canBuy(gif.id) ? `is-buy-button` : 'bought'} onClick={() => buyItem(gif)}> {!canBuy(gif.id) ? `Acheter` : 'V'} </button>
                        </div>

                    </div>
                ))}
            </div>

            <div className='is-moneyContainer'>
                {money} $
            </div>

            {/* Boutons de navigation */}
            <div className="is-navigation">
                {currentPage === 1 ? null : <button className="is-previous" onClick={() => goToPreviousPage()}>Previous Page</button>}
                {currentPage === lastPage ? null : <button className="is-next" onClick={() => goToNextPage()}>Next Page</button>}
            </div>

            <div className="is-leave">
                <button className="is-leave-button" onClick={() => leave()}>Quitter</button>
            </div>
        </div>
    );

}

export default ItemShop;