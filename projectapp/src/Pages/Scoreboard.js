import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG';
import './CSS/scoreboard.css';

const Scoreboard = () => {
    
    const playername = sessionStorage.getItem("name");
    const [players, setPlayers] = useState([]);

    const navigate = useNavigate();
    
    useEffect(() => {

        if (sessionStorage.getItem("name") == null) { navigate("/login-signup"); }

        socket.emit('askNames'); 
        socket.on('askNames', (names) => {
            setPlayers(names); 
        });
        
        socket.emit("askScoreboard");
        socket.on('scoreboard', (scores) => {
            setPlayers(scores);
        });

        return () =>  {
            socket.off('askNames'); 
            socket.off('scoreboard');
        }
    }, [navigate]);

    const leave = () => {
        navigate('/BrowserManager');
    }


    function trie(x) {
        const scoreIndex = x - 1; // indices de tableau commencent à 0
    
        // Copie et trie le tableau de joueurs
        const sorted = [...players].sort((a, b) => b.scores[scoreIndex] - a.scores[scoreIndex]);
    
        setPlayers(sorted);
    }
    
    return (
        <div className='sb-container'>
            <div className='sb-tableau'>
                <div className='sb-title'>
                    <h1>Scoreboard Global - Nombre de win </h1>
                    <p>Cliquez sur les en-têtes des colonnes pour trier</p>
                </div>
                <div className='sb-table'>
                    <div className='sb-header'>
                        <div className='sb-header-item'><h3>Nom</h3></div>
                        <div className='sb-header-item' onClick={() => trie(1)}><h3>Bataille ouverte</h3></div>
                        <div className='sb-header-item' onClick={() => trie(2)}><h3>Six qui prend</h3></div>
                        <div className='sb-header-item' onClick={() => trie(3)}><h3>Mille bornes</h3></div>
                        <div className='sb-header-item' onClick={() => trie(4)}><h3>Money</h3></div>
                    </div>
                    <div className='sb-body'>
                        {players.map((player, index) => (
                            <div className={`sb-row ${index % 2 === 0 ? 'even' : 'odd'} ${player.nom === playername ? 'player-class' : ''}`} key={index}>
                                <div className='sb-cell'>{player.nom}</div>
                                <div className='sb-cell'>{player.scores[0]}</div>
                                <div className='sb-cell'>{player.scores[1]}</div>
                                <div className='sb-cell'>{player.scores[2]}</div>
                                <div className='sb-cell'>{player.scores[3]}</div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <div className='sb-leave'>
                <button onClick={leave}>Retour</button>
            </div>
        </div>
    );
}

export default Scoreboard;