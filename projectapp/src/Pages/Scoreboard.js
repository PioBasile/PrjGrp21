import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG';
import './CSS/scoreboard.css';

const Scoreboard = () => {

    const playername = sessionStorage.getItem("name");
    const [players, setPlayers] = useState([]);
    // const [bataille, setBataille] = useState('0');
    // const [sqp, setSqp] = useState('0');
    // const [mille, setMille] = useState('0');
    // const [money, setMoney] = useState('0');

    const navigate = useNavigate();

    useEffect(() => {

        let mounted = true;

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


    return (
        <div className='sb-container'>
            <div className='sb-tableau'>
                <div className='sb-title'>
                    <h1>Scoreboard Global - Nombre de win </h1>
                </div>
                <div className='sb-table'>
                    <div className='sb-header'>
                        <div className='sb-header-item'><h2>Nom</h2></div>
                        <div className='sb-header-item'><h2>Bataille ouverte</h2></div>
                        <div className='sb-header-item'><h2>Six qui prend</h2></div>
                        <div className='sb-header-item'><h2>Mille bornes</h2></div>
                        <div className='sb-header-item'><h2>Money</h2></div>
                    </div>
                    <div className='sb-body'>
                        {Object.entries(players).map(([nom, scores], index) => (
                            <div className={`sb-row ${index % 2 === 0 ? 'even' : 'odd'} ${nom === playername ? 'gold-class' : ''}`}>
                                <div className='sb-cell'>{nom}</div>
                                <div className='sb-cell'>{scores[0]}</div>
                                <div className='sb-cell'>{scores[1]}</div>
                                <div className='sb-cell'>{scores[2]}</div>
                                <div className='sb-cell'>{scores[3]}</div>
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