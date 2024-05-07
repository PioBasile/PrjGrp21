import React, { useState, useEffect } from 'react';
import './CSS/Login-signup.css';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG.js'


const LoginSignup = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isWrong, setIsWrong] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        sessionStorage.clear();

    }, [])

    useEffect(() => {


        socket.on("succes", (cookie, user) => {
            sessionStorage.setItem("connection_cookie", cookie);
            sessionStorage.setItem("name", user);
            navigate('/BrowserManager');
        });
        socket.on('failure', () => {
            setIsWrong(true);
        });


    }, [navigate])

    const login = () => {
        socket.emit('login', username, password);
    }

    const register = () => {
        socket.emit('register', username, password);
    }
      


    return (
        <div className="login-signup-container">
            <div className="description-container">
                <h1>Projet Programmation</h1>
                <div className="project-info">
                    <div className='ls-transition'>
                        <h3 onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)}>
                            Réalisé par&nbsp;
                            <div className="text-container">
                                <div className={`fade-text ${isHovered ? 'faded-out' : ''}`}> Groupe </div>
                                <div className={`fade-text ${isHovered ? '' : 'faded-out'}`}> Trisomie </div>
                            </div>
                            <div className="number-21">21</div>
                        </h3>
                    </div>
                    <div className='ls-separator-line'></div>
                    <h5>REY Dorian</h5>
                    <h5>MAUGER Florian</h5>
                    <h5>BASILE Francesco-Pio</h5>
                </div>
            </div>
            <div className="login-container">
                <div className='lo-si'> <h1>Connexion ou Inscription</h1></div>
                {isWrong && <div className='wrongStuff'>Nom d'utiliseur ou mot de passe incorrecte !</div>}
                <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    id="username"
                    className="input-button"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    id="loginPassword"
                    className="input-button"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    />



                <div className="button-container">
                    <button
                        id="loginButton"
                        className="button"
                        onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={e => e.target.style.backgroundColor = '#0066cc'}
                        onClick={login}
                    >
                        Connection
                    </button>

                    <button
                        id="signupButton"
                        className="button"
                        onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={e => e.target.style.backgroundColor = '#0066cc'}
                        onClick={register}
                    >
                        Inscription
                    </button>
                </div>
            </div>
        </div>

    )
};



export default LoginSignup;
