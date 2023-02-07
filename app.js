const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const port = process.env.PORT || 6969;
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

{
  const players = {};

  io
    .of('/socket/5')
    .on("connection", (socket) => {
      console.log("someone connected!", socket.id);

      players[socket.id] = {};

      socket.on("disconnect", () => {
        console.log("someone disconnected!", socket.id);
        socket.broadcast.emit("player-disconnect", players[socket.id]);
        delete players[socket.id];
        console.log(players);
      });

      socket.on("join-game", (playerData) => {
        players[socket.id] = playerData;
        players[socket.id].id = socket.id;

        const allOtherPlayers = { ...players };
        delete allOtherPlayers[socket.id];

        console.log(players);

        socket.emit("you-joined", players[socket.id]);
        socket.emit("all-players", allOtherPlayers);
        socket.broadcast.emit("player-joined", players[socket.id]);

      });

      socket.on('player-moved', (position) => {
        const playerData = players[socket.id];
        playerData.position = position;

        socket.broadcast.emit('player-moved', playerData);
      });
    });
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', async (req, res, next) => {
  return res.sendFile('./index.html', { root: __dirname });
});

app.post('/test', async (req, res, next) => {
  console.log("TEST:")
  console.log(req.body);
  console.log();

  return res.sendStatus(200);
});

app.get('/registry', async (req, res, next) => {
  const data = fs
    .readdirSync('./labs')
    .map(lab => lab.replace('.html', ''))
    .sort((a, b) => +a.split('-')[0] - +b.split('-')[0]);

  return res.send(data);
});

app.get('/:labName', async (req, res, next) => {
  const { labName } = req.params;
  const fileName = `${labName}.html`;
  const files = fs.readdirSync('./labs');
  if (!files.includes(fileName)) return res.redirect('/');

  return res.sendFile(`./labs/${fileName}`, { root: __dirname });
});

app.get('*', async (req, res) => res.sendStatus(404));

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`\nlistening on 0.0.0.0:${port}\n`);
});