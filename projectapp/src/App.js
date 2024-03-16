import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes,Navigate } from "react-router-dom";
import './Pages/CSS/App.css';
import Start from "./Pages/Start.js";
import LoginSignup from "../src/Pages/Login-signup";
import JeuBataille from "./Pages/JeuBataille.js";
import VictoryScreen from "./Pages/VicroryScreen.js";
import SixQuiPrend from "./Pages/jeuSQP.js"
import Roulette from "./Pages/Roulette.js"
import MilleBorne from "./Pages/MilleBorne";
import socket from './socketG';
import NewBrowserManager from './Pages/NewBrowserManager'
import BlackJack from "./Pages/BlackJack";
import ItemShop from "./Pages/ItemShop.js";
import Casino from "./Pages/Casino.js";
import NewLobby from "./Pages/NewLobby.js";
import { useNavigate, useLocation  } from 'react-router-dom';

function App() {

    const navigate = useNavigate();
    const location = useLocation();

    setInterval(() => {
        if(sessionStorage.getItem("name") === ""){return}
        socket.emit("player_auth_validity", {player_name:sessionStorage.getItem("name"),cookie:sessionStorage.getItem("connection_cookie")});
    }, 2000);


    /*
    ⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⣶⣶⣶⣶⣄⠀ ⢠⣄⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣾⣿⣿TOUS⣿⣿⣿⠀ ⢀⣿⣿⣦⡀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣴⣿GOUVERNER⣸⣿⣿⡏⠀⢸⣿⣿⣿⣷⡄⠀
⠀⠀⠀⠀⢀⣾⣿⣿⠋LES⠀⣰⣶⣾⣿⡿⠟⠀ ⢠⣿⣿⣿⣿⣿⣿⡄
⠀⠀⠀⣴⣿⣿⠟⠛POUR⣿⣿⣿⡿⠛⠉⠀⠀⢠⣾⣿⣿⣿⣿⣿⣿⡇
⠀⢀⣾⣿⣿EFFECT⣶⣾⣿⡿⠋⠀⠀⠀⠀⣰⣿⣿⡟⠉⢻⣿⣿⣿⠇
 ⣾⣿⡏USE⢀⣀⣴⣿⡿⠋⠀⠀⠀⠀⣠⣾⣿⣿⠋⠁⠀⢀⣿⣿⡟⠀
⢸⣿⣿⣧LE⣼⣿⣿⡟⠁⠀⠀⠀⣠⣾⣿⣿⠛⠛⠀⠀⣾⣿⣿⡟⠀⠀
⠸⣿⣿⣿⣿⣿⡿⠏⠀⠀⢀⣠⣾⣿⡿⠿⠿⠀⢠⣤⣾⣿⣿⠟⠀⠀⠀
⠀⠈⠉⠉⠁⠀⢀⣀⣤⣾⣿⣿⠿⠿⠃⠀⣀⣠⣾⣿⣿⡿⠃⠀⠀⠀⠀
⠀⠳⣶⣶⣶⣿⣿⣿⣿⣿⣿⣏⠀⢀⣀⣠⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀
⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣾⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠙⠻⢿⣿⣿⣿⣿⣿⣿⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
*/
    useEffect(() => {

        sessionStorage.setItem("location", location.pathname);

        if(location.pathname === "/BrowserManager" || location.pathname === "/start" || location.pathname === "/login-signup"){

            if(sessionStorage.getItem("serverConnected") > 0){
                        socket.emit('deco_lobby', sessionStorage.getItem("serverConnected"), sessionStorage.getItem('name'));
                        socket.emit('leave', sessionStorage.getItem("serverConnected"));
                        sessionStorage.setItem('serverConnected', -1);
                    }

        }
        
    
        
      }, [location]);

    useEffect(() => {


        socket.on("sentinel_auth_error", () => {

            navigate("/login-signup");

            if(sessionStorage.getItem("name") === ""){return}

            sessionStorage.setItem("name", "");
            sessionStorage.setItem("connection_cookie", "");

            alert("Erreur d'authentification !");

            

        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (

            <Routes>
                <Route path="/start" element={<Start/>} />
                <Route path="/roulette" element={<Roulette/>} />
                <Route path="/sqp" element={<SixQuiPrend/>} />
                <Route refresh={true} path="/login-signup" element={<LoginSignup/>} />
                <Route path='/Lobby' element={<NewLobby/>}/>
                <Route path="/batailleOuverte" element={<JeuBataille/>} />
                <Route path="/winner" element={<VictoryScreen/>} />
                <Route path="/" element={<Navigate to="/start" replace />} />
                <Route path="/mb" element={<MilleBorne></MilleBorne>}/>
                <Route path="/BrowserManager" element={<NewBrowserManager></NewBrowserManager>}/>
                <Route path="/blackJack" element={<BlackJack></BlackJack>}/>
                <Route path="/itemshop" element={<ItemShop></ItemShop>}/>
                <Route path="/casino" element={<Casino></Casino>}/>
            </Routes>
    );
}

export default App;