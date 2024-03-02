const express = require('express');
const app = express();
const http = require('http');
const {Server} = require("socket.io");
const server = http.createServer(app);

/*     \CORS/    */
const cors = require("cors");
app.use(cors());

const io = new Server(server, {
    cors: {
        origin:"http://localhost:3000",
        methods: ["GET", "POST"],
    },
    
});


server.listen(3001, () =>{
    console.log("Le Serveur est en ligne.");
})

io.on('connection', (socket) => {
    console.log('Connection par : %s',socket.id);

    socket.on('login', (username, password) => {

        socket.emit("succes","111","dazdazd");

    });


    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);
    });
});




/*     \FIN CORS/    */