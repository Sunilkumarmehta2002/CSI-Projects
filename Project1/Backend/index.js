const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const users = require('./users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  secure: true
});

app.use(cors());
app.use(express.json());

const SECRET = 'secretkey';

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (users[username]) return res.status(400).send('User already exists');
  const hashed = await bcrypt.hash(password, 10);
  users[username] = { password: hashed };
  res.send('Registered');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(400).send('Invalid');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send('Wrong password');
  const token = jwt.sign({ username }, SECRET);
  res.json({ token });
});

io.on('connection', (socket) => {
  socket.on('send-file', ({ to, filename, file, from }) => {
    socket.to(to).emit('receive-file', { filename, file, from });
  });

  socket.on('join', (userId) => {
    socket.join(userId);
  });
});

server.listen(5000, () => console.log('Server on 5000'));