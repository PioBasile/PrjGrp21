import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CSS/VictoryScreen.css'; 
import fireworks from './CSS/vids/fireworks.mp4';

const VictoryScreen = () => {
    const [redirectTimer, setRedirectTimer] = useState(10);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setRedirectTimer(prevTimer => prevTimer - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);


    useEffect(() => {
        if (redirectTimer == 0) {
            window.location.href = '/BrowserManager';
        }
    }, [redirectTimer]);

    return (
        <div className="victory-container">
            
            <div className="victory-background">
                <video src={fireworks} autoPlay loop muted/>
            </div>
            
            <div className="victory-text">
                <h1>
                    {sessionStorage.getItem('winners').split(',').length <= 1 ? 
                        sessionStorage.getItem('winners')  + " a gagné" : 
                        sessionStorage.getItem('winners').split(',').join(", ") + " ont gagné !"
                    }
                </h1>
            </div>

            <div className="victory-timer">
                <p>Vous serez redirigé automatiquement vers la liste des serveurs dans {redirectTimer} secondes.</p>
            </div>   

            <div className="victory-button">
                <Link to="/BrowserManager">
                    <button>Retour à la liste des serveurs</button>
                </Link>
            </div>
            
        </div>
    );
}

export default VictoryScreen;
