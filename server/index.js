const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Generate random bingo card numbers
function generateBingoCard() {
  const card = [];
  const used = new Set();
  
  for (let i = 0; i < 5; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      let num;
      do {
        num = Math.floor(Math.random() * 75) + 1;
      } while (used.has(num));
      used.add(num);
      row.push(num);
    }
    card.push(row);
  }
  // Make center cell free
  card[2][2] = "FREE";
  return card;
}

// Store active games
const games = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('createGame', () => {
    const gameId = Math.random().toString(36).substring(7);
    games.set(gameId, {
      players: [socket.id],
      numbers: [],
      currentNumber: null
    });
    socket.join(gameId);
    socket.emit('gameCreated', { gameId, card: generateBingoCard() });
  });

  socket.on('joinGame', (gameId) => {
    const game = games.get(gameId);
    if (game) {
      game.players.push(socket.id);
      socket.join(gameId);
      socket.emit('gameJoined', { gameId, card: generateBingoCard() });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 