import React, { useState } from 'react';
//import Popup from 'reactjs-popup';
import './CSS/Login-signup.css';
import { useNavigate } from 'react-router-dom';
import {useEffect} from "react";
import io from 'socket.io-client';
const socket = io.connect("http://localhost:3001")

const LoginSignup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    

    useEffect(() => {

        sessionStorage.clear();
        
        socket.on("succes", (cookie,user) => {
            
            sessionStorage.setItem("connection_cookie", cookie);
            sessionStorage.setItem("name", user);
            navigate('/ServerBrowser');
            console.log("test");
        });
        socket.on('failure',() => {
            console.log("FAIL");
        });
        // eslint-disable-next-line
      }, [username])

    function login(){
        socket.emit('login', username, password);
    }

    function register(){
        socket.emit('register', username, password);
    }


    return (
        <div className="login-signup-container">
            <div className="login-container">
                <h1>Login or Signup</h1>
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
                    id="password"
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
                        onClick={()=>{login()}} // huh ?
                    >
                        Login
                    </button>
                    
                    <button
                        id="signupButton"
                        className="button"
                        onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={e => e.target.style.backgroundColor = '#0066cc'}
                        onClick={()=>{register()}}
                    >
                        Signup
                    </button>
                </div>
            </div>
        </div>
    
    )
};



export default LoginSignup;
