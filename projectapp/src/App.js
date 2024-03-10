import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes,Navigate } from "react-router-dom";
import Start from "./Pages/Start.js";
import LoginSignup from "../src/Pages/Login-signup";
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
import Casino from "./Pages/Casino.js";
import NewLobby from "./Pages/NewLobby.js";
import { useNavigate, useLocation  } from 'react-router-dom';

function App() {

    const navigate = useNavigate();
    const location = useLocation();

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

    
    
      }, [location]);

    useEffect(() => {

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