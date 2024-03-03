import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG';
import './CSS/NewBrowserManager.css'

export const NewBrowserManager = () => {
    const profil = require("./CSS/userIcon.png")
    const [isPrivate, setIsPrivate] = useState(false);


    const ElementAvecBouton = ({ children }) => {
        const [boutonVisible, setBoutonVisible] = useState(false);

        return (
            <div
                className={`element-container ${boutonVisible ? 'visible' : ''}`}
                onMouseEnter={() => setBoutonVisible(true)}
                onMouseLeave={() => setBoutonVisible(false)}
            >
                {children}
            </div>
        );
    };

    return (
        <div className='BM-container'>
            <div className='BM-profil'>

                <h2 className='MB-h2 MB-profil'> PROFIL </h2>
                <div className='BM-info-profil hide'>
                    PLAYERNAME: florian
                </div>
                <div className='BM-info-profil hide'>
                    Parties Jouer : 100
                </div>
                <div className='BM-info-profil hide'>
                    Parties Gagner : 188
                </div>
                <div className='BM-info-profil hide'>
                    MONEY : 1000$
                </div>
            </div>

            <div className='BM-acttion-container'>
                <h2 className='MB-h2'> CREER LE SERVER</h2>

                <div className='BM-input-container'>

                    <input type="text" className="BM-input" placeholder='Nom Partie...' ></input>
                    <input type="password" className="BM-input" placeholder='Mot de passe...'></input>
                    <input type="number" className="BM-input gameNameMargin" placeholder='Nombre de joueurs'></input>

                </div>

                <div className='BM-creerButton-container'>
                    <button onClick={null} className="BM-button">CRÉER</button>
                </div>

            </div>
            {/* du vide */}

            <div className='BM-serverList-container'>

                <h2 className='MB-h2'> SERVER LISTE</h2>
                <ElementAvecBouton>

                    <div className='BM-server'>ServerName (gameType) 1/10</div>
                </ElementAvecBouton>
                <ElementAvecBouton>

                    <div className='BM-server'>ServerName (gameType) 1/10</div>
                </ElementAvecBouton>
                <ElementAvecBouton>

                    <div className='BM-server'>ServerName (gameType) 1/10</div>
                </ElementAvecBouton>
                <ElementAvecBouton>

                    <div className='BM-server'>ServerName (gameType) 1/10</div>
                </ElementAvecBouton>
            </div>
        </div>
    )
}
