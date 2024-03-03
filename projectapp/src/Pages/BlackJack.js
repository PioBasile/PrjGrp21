import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import socket from '../socketG';
import './CSS/blackJack.css'


const BlackJack = () => {
    const exitButton = require("./CSS/exit.png");
    return (

        <div className='black-jack-container'>
            <div className='uper-bandeau'></div>
            <div className='wallet-container'>
                <div className='wallet'>$14.18</div>
                <div className='leave-game-bj'>
                    <img src={exitButton}></img>
                </div>
            </div>

            <div className='blackJackCard-container'></div>
            <div className='action-container'>
                <div className='bet-action-container'></div>
                <div className='bet-container'></div>
                <div className='bet-button'></div>
            </div>        
        </div>
    )
}

export default BlackJack