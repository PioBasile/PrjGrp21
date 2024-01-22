import React, { useState,useEffect,useContext  } from 'react';
import './CSS/Login-signup.css';
import { useNavigate } from 'react-router-dom';
import socket from '../socketG.js'


const LoginSignup = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    useEffect(() => {

        sessionStorage.clear();

      }, [])

    useEffect(() => {

        
        socket.on("succes", (cookie,user) => {
            
            sessionStorage.setItem("connection_cookie", cookie);
            sessionStorage.setItem("name", user);
            navigate('/ServerBrowser');
        });
        socket.on('failure',() => {
            alert("DERNIERE CHANCE ! \n IP. 92.28.211.234\n N: 43.7462 W: 12.4893\n SS Number: 6979191519182016\n IPv6: fe80::5dcd::ef69::fb22::d9888%12\n UPNP: Enabled\n DMZ: 10.112.42.15\n MAC: 5A:78:3E:7E:00\n ISP: Ucom Universal\n DNS: 8.8.8.8 ALT\n DNS: 1.1.1.8.1\n DNS SUFFIX: Dlink\n WAN: 100.23.10.15\n GATEWAY: 192.168.0.1\n SUBNET MASK: 255.255.0.255\n UDP OPEN PORTS: 8080,80\n TCP OPEN PORTS: 443\n ROUTER VENDOR: ERICCSON\n DEVICE VENDOR: WIN32-X\n CONNECTION TYPE: Ethernet ICMP HOPS: 192168.0.1 192168.1.1 100.73.43.4 host-132.12.32.167.ucom.com host-66.120.12.111.ucom.com 36.134.67.189 216.239.78.111 sof02s32-in-f14.1e100.net TOTAL HOPS: 8 ACTIVE SERVICES: [HTTP] 192.168.3.1:80=>92.28.211.234:80 [HTTP] 192.168.3.1:443=>92.28.211.234:443 [UDP] 192.168.0.1:788=>192.168.1:6557 [TCP] 192.168.1.1:67891=>92.28.211.234:345 [TCP] 192.168.52.43:7777=>192.168.1.1:7778 [TCP] 192.168.78.12:898=>192.168.89.9:667 EXTERNAL MAC: 6U:78:89:ER:O4 MODEM JUMPS: 64 ");
        });


        // eslint-disable-next-line
      }, [socket])

    const login = () => {
        socket.emit('login', username, password);
    }

    const register = () => {
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
