import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes,Navigate } from "react-router-dom";
import Start from "./Pages/Start.js";
import LoginSignup from "../src/Pages/Login-signup";
import BrowserAccountManager from './Pages/BrowserAccountManager.js';
import Lobby from './Pages/Lobby.js'
import JeuBataille from "./Pages/JeuBataille.js";
import VictoryScreen from "./Pages/VicroryScreen.js";
import SixQuiPrend from "./Pages/jeuSQP.js"
import Roulette from "./Pages/Roulette.js"
import MilleBorne from "./Pages/MilleBorne";
import socket from './socketG';
import NewBrowserManager from './Pages/NewBrowserManager'
import BlackJack from "./Pages/BlackJack";
import ItemShop from "./Pages/ItemShop.js";

function App() {

    useEffect(() => {

        const handleBeforeUnload = (event) => {

          event.preventDefault();
          event.returnValue = 'Êtes-vous sûr de vouloir quitter ?';



        if (window.location.pathname === "/ServerBrowser") {
            console.log('Vous êtes sur la page "/ServerBrowser".');
        }
        
        if (window.location.pathname === "/login-signup") {
            console.log('Vous êtes sur la page "/login-signup".');
        }

        if (window.location.pathname === "/Lobby") {
            console.log('Vous êtes sur la page "/Lobby".');
            socket.emit('deco_lobby', sessionStorage.getItem("serverConnected"), sessionStorage.getItem('name'));
            socket.emit('leave', sessionStorage.getItem("serverConnected"));
            sessionStorage.setItem('serverConnected', -1);
        }

        if (window.location.pathname === "/jeu") {
            console.log('Vous êtes sur la page "/jeu".');
        }


        };

        const handlePopstate = () => {

            if (window.location.pathname === "/ServerBrowser") {
                console.log('Vous êtes sur la page "/Lobby".');
                socket.emit('deco_lobby', sessionStorage.getItem("serverConnected"), sessionStorage.getItem('name'));
                socket.emit('leave', sessionStorage.getItem("serverConnected"));
                sessionStorage.setItem('serverConnected', -1);
            }

        }
    
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopstate);
    
        return () => {
            socket.disconnect();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      }, []);
    

    return (
   
        <Router>
            <Routes>
                <Route path="/start" element={<Start/>} />
                <Route path="/roulette" element={<Roulette/>} />
                <Route path="/sqp" element={<SixQuiPrend/>} />
                <Route path="/login-signup" element={<LoginSignup/>} />
                <Route path='/Lobby' element={<Lobby/>}/>
                <Route path="/batailleOuverte" element={<JeuBataille/>} />
                <Route path="/winner" element={<VictoryScreen/>} />
                <Route path="/" element={<Navigate to="/start" replace />} />
                <Route path="/mb" element={<MilleBorne></MilleBorne>}/>
                <Route path="/BrowserManager" element={<NewBrowserManager></NewBrowserManager>}/>
                <Route path="/blackJack" element={<BlackJack></BlackJack>}/>
                <Route path="/itemshop" element={<ItemShop></ItemShop>}/>
            </Routes>
        </Router>
    );
}

export default App;