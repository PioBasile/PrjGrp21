import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import './CSS/card.css';

const ServerList = ({servers, handleClick, handlePassword}) => {
  const joinServer = (id) => {
    console.log(`Joining server ${id}`);
    // Ajoutez votre logique de redirection ou d'action de rejoindre le serveur ici
  };

  return (
<div className="server-container">
      {servers.map((server) => (
        <div key={server.id} className="submitServer">
        <div className="text-card">
          <p>{server.serverName}{"(" + server.playerList.length + "/" + server.nbPlayerMax + ")"}</p>
          </div>
          {// eslint-disable-next-line
           (server.playerList.length) != server.nbPlayerMax && server.isPrivate && (
            <div className='input password'>
            <input
              type="password"
              placeholder="password..."
              onChange={(e) => {handlePassword(e.target.value)}}
            />
            </div>
          )}
          <button class="submit small"onClick={() => handleClick(server.id,server)} disabled={// eslint-disable-next-line
          (server.playerList.length) == server.nbPlayerMax}>
            {// eslint-disable-next-line
            server.playerList.length == server.nbPlayerMax ? 'FULL' : 'Rejoindre'}
          </button>
        </div>
      ))}
    </div>
  );
};




export default ServerList;
