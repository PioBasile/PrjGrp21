import React, { useState, /*useEffect */} from 'react';
import './CSS/ItemShop.css';

const ItemShop = () => {
    const gif= require("./CSS/cartes6/1.svg");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6); 
    const [money, setMoney] = useState(1000);

    const gifs = [
        { id: 1, name: 'Emote 1', price: 100 , image:gif},
        { id: 2, name: 'Emote 2', price: 100 , image:gif},
        { id: 3, name: 'Emote 3', price: 100 , image:gif},
        { id: 4, name: 'Emote 4', price: 100 , image:gif},
        { id: 5, name: 'Emote 5', price: 100 , image:gif},
        { id: 7, name: 'Emote 6', price: 100 , image:gif},
        { id: 8, name: 'Emote 7', price: 100 , image:gif},
        { id: 9, name: 'Emote 8', price: 100 , image:gif},
        { id: 10, name: 'Emote 9', price: 100 , image:gif},
        { id: 11, name: 'Emote 10', price: 100 , image:gif},
        { id: 12, name: 'Emote 11', price: 100 , image:gif},
    ];
    
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
    

    // ------------------------ TO DO -------------------- 
    // on click play the gif + sound
    // check if user money is enough to buy
    // 

    return (
        <div className='item-shop-container'>
            <div className='item-shop-title'><h2> <strong> Le Item Shop </strong> </h2> </div>
            <div className='is-page'> Page {currentPage} de {lastPage} </div>
            <div className="item-shop">
                {currentItems.map((gif) => (
                    <div key={gif.id} className="item-container">
                        <div className="is-item-info">
                            <div className="name-price-container"> 
                                <div className="is-gif-name">{gif.name}</div>
                                <div className="is-gif-price">{gif.price} $</div>
                            </div>  
                            <div className="is-item">
                                <img src={gif} alt={gif.name} />
                            </div>
                            <div className="separator-line"></div>
                            <button className="is-buy-button"> Acheter </button> 
                        </div>
                         
                    </div> 
                ))}
            </div>
            
            <div className='is-moneyContainer'>
                {money} $
            </div> 

            {/* Boutons de navigation */}
            <div className="is-navigation">
                <button className="nav-button" onClick={goToPreviousPage} disabled={currentPage === 1}>Previous Page</button>
                <button className="nav-button" onClick={goToNextPage} disabled={currentPage === lastPage}>Next Page</button>
            </div>
        </div>           
    );

}

export default ItemShop;