import React from 'react';
import './CSS/VictoryScreen.css'; // Assurez-vous de créer ce fichier CSS

const VictoryScreen = () => {
    return (
        <div className="victory-container">
            <h1>
                {sessionStorage.getItem('winners').split(',').length <= 1? sessionStorage.getItem('winners')  + " a gagner" : sessionStorage.getItem('winners').split(',').map((player) => 
                
                    player + ""
                
                ) + " ont gagner !"}</h1>
        </div>
    );
}

export default VictoryScreen;