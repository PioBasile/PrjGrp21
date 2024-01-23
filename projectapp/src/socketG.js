import io from 'socket.io-client';
let socket;

if (!socket || !socket.connected) {
  socket = io("http://localhost:3001");
}


export default socket;