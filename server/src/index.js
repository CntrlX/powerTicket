const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Add io to request object for socket access in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Ticket System API' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Join ticket room
  socket.on('join_ticket', (ticketId) => {
    socket.join(ticketId);
    console.log(`User joined ticket room: ${ticketId}`);
  });

  // Leave ticket room
  socket.on('leave_ticket', (ticketId) => {
    socket.leave(ticketId);
    console.log(`User left ticket room: ${ticketId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 