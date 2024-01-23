import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ServerList = ({servers, handleClick, handlePassword}) => {
  

  return (
<div className="server-container">
      {servers.map((server) => (
        <div key={server.id} className="submitServer">
        <div className="text-card">
          <p>{server.serverName}{"(" + server.playerList.length + "/" + server.nbPlayerMax + ")"}</p>
          </div>
          {
           (server.playerList.length) !== server.nbPlayerMax && server.isPrivate && (
            <div className='input password'>
            <input
              type="password"
              placeholder="password..."
              onChange={(e) => {handlePassword(e.target.value)}}
            />
            </div>
          )}
          <button className="submit small"onClick={() => handleClick(server.id,server)} disabled={
          (server.playerList.length) === server.nbPlayerMax}>
            {
            server.playerList.length === server.nbPlayerMax ? 'FULL' : 'Rejoindre'}
          </button>
        </div>
      ))}
    </div>
  );
};




export default ServerList;
