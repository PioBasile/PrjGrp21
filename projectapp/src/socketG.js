import io from 'socket.io-client';
let socket;

if (!socket || !socket.connected) {
  socket = io("https://grp21backend.onrender.com");
}


export default socket;