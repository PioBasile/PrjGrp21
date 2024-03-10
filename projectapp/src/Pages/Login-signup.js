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

    // const  HandleEnterLogin = () => {
    //     function sendMessageOnEnter(event) {
    //         if (event.key === "Enter") {
    //             socket.emit("login", username, password);
    //         }
    //     }

    //     document.addEventListener("keydown", sendMessageOnEnter);

    //     return () => {
    //         document.removeEventListener('keydown', sendMessageOnEnter);
    //     };
    // }
    // function HandleEnterLogin({ username, password }) {
    //     useEffect(() => {
    //       let passwordContainer = document.getElementById("loginPassword");
    //       if (passwordContainer == null) {
    //         return 0;
    //       }
      
    //       function sendMessageOnEnter(event) {
    //         var clickedElement = event.target.id;
    //         if (event.key === "Enter" && clickedElement === "loginPassword") {
    //           // Assurez-vous que username et password sont définis avant d'utiliser
    //           // les variables dans cette fonction.
    //           socket.emit("login", username, password);
    //         }
    //       }
      
    //       document.getElementById("loginPassword").addEventListener('keydown', sendMessageOnEnter);
      
    //       return () => {
    //         document.getElementById("loginPassword").removeEventListener('keydown', sendMessageOnEnter);
    //       };
    //     }, [username, password]); // Ajout de username et password aux dépendances
      
    //     return <div></div>;
<<<<<<< HEAD
    // }
=======
    //   }
>>>>>>> 300295f063661906c01fea804fbdc5dfcd3d0fd7
      


    return (
        <div className="login-signup-container">
            {/* <HandleEnterLogin></HandleEnterLogin> */}
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
                <div className='lo-si'> <h1>Login or Signup</h1></div>
                {isWrong && <div className='wrongStuff'>Incorrect login or password please try again !</div>}
                <input
                    type="text"
                    placeholder="Username"
                    id="username"
                    className="input-button"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    id="loginPassword"
                    className="input-button"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />



                <div className="button-container">
                    <button
                        id="loginButton"
                        className="button"
                        onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={e => e.target.style.backgroundColor = '#0066cc'}
                        onClick={login}
                    >
                        Login
                    </button>

                    <button
                        id="signupButton"
                        className="button"
                        onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={e => e.target.style.backgroundColor = '#0066cc'}
                        onClick={register}
                    >
                        Signup
                    </button>
                </div>
            </div>
        </div>

    )
};



export default LoginSignup;
