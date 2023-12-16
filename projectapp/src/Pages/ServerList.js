import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/card.css';

const ServerList = ({servers, handleClick, handlePassword}) => {
  

  return (
    <div className="card-container">
      {servers.map((server) => (
        <div key={server.id} className="card">
          <p>{server.serverName}{"(" + server.playerList.length + "/" + server.nbPlayerMax + ")"}</p>
          {// eslint-disable-next-line
           (server.playerList.length) != server.nbPlayerMax && server.isPrivate && (
            <input
              type="password"
              placeholder="Entrez le mot de passe"
              onChange={(e) => {handlePassword(e.target.value)}}
            />
          )}
          <button onClick={() => handleClick(server.id,server)} disabled={// eslint-disable-next-line
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
