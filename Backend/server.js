const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET','POST','PUT','DELETE'] }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());
app.set('io', io);

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/vehicles',  require('./routes/vehicles'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/alerts',    require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-vehicle', (id) => socket.join(id));
  socket.on('disconnect', () => console.log('Client disconnected'));
});

const { simulateLiveUpdates } = require('./utils/simulator');
simulateLiveUpdates(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`TrackCore running on port ${PORT}`));
