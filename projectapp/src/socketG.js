import io from 'socket.io-client';
let socket;

if (!socket || !socket.connected) {
  socket = io("https://skibidi.igf.cnrs.fr/");
}


export default socket;