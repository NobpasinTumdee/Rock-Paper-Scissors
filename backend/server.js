const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let players = [];
let choices = {};

function determineWinner() {
  const [p1, p2] = players;
  const c1 = choices[p1];
  const c2 = choices[p2];

  if (c1 === c2) return 'draw';

  if (
    (c1 === 'rock' && c2 === 'scissors') ||
    (c1 === 'paper' && c2 === 'rock') ||
    (c1 === 'scissors' && c2 === 'paper')
  ) return p1;

  return p2;
}

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  if (players.length < 2) {
    players.push(socket.id);
    socket.emit('waiting', 'รอผู้เล่นอีกคน...');
  }

  if (players.length === 2) {
    io.to(players[0]).emit('start', 'เกมเริ่มแล้ว!');
    io.to(players[1]).emit('start', 'เกมเริ่มแล้ว!');
  }

  socket.on('choice', (choice) => {
    choices[socket.id] = choice;
    console.log(`${socket.id} เลือก ${choice}`);

    if (Object.keys(choices).length === 2) {
      const winner = determineWinner();
      const result = {
        choices,
        winner
      };

      io.to(players[0]).emit('result', result);
      io.to(players[1]).emit('result', result);

      // reset
      choices = {};
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    players = players.filter(p => p !== socket.id);
    choices = {};
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
