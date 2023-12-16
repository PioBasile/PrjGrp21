import React from "react";
import { BrowserRouter as Router, Route, Routes,Navigate } from "react-router-dom";

import Start from "../src/Pages/start";
import LoginSignup from "../src/Pages/Login-signup";
import BrowserAccountManager from './Pages/BrowserAccountManager.js';
import Lobby from './Pages/Lobby.js'
import JeuBataille from "./Pages/JeuBataille.js";
import VictoryScreen from "./Pages/VicroryScreen.js";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/start" element={<Start/>} />
                <Route path="/login-signup" element={<LoginSignup/>} />
                <Route path='/ServerBrowser' element={<BrowserAccountManager/>} />
                <Route path='/Lobby' element={<Lobby/>}/>
                <Route path="/jeu" element={<JeuBataille/>} />
                <Route path="/winner" element={<VictoryScreen/>} />
                <Route path="/" element={<Navigate to="/start" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
