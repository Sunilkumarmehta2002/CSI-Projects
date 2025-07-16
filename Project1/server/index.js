const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Datastore = require('nedb-promises');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize NeDB databases
const usersDb = Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true });
const transfersDb = Datastore.create({ filename: path.join(dataDir, 'transfers.db'), autoload: true });

// JWT Secret
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const ENCRYPTION_KEY = 'your-32-char-encryption-key-here';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await usersDb.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      isOnline: false,
      lastSeen: new Date(),
      status: 'offline'
    };

    const savedUser = await usersDb.insert(user);

    // Generate JWT
    const token = jwt.sign({ 
      userId: savedUser._id, 
      username: savedUser.username 
    }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await usersDb.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update user status
    await usersDb.update({ _id: user._id }, { $set: { 
      isOnline: true, 
      lastSeen: new Date(),
      status: 'online'
    }});

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (for recipient selection)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await usersDb.find({ 
      _id: { $ne: req.user.userId } 
    });
    
    const filteredUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      isOnline: user.isOnline || false,
      status: user.status || 'offline',
      lastSeen: user.lastSeen
    })).slice(0, 50);
    
    res.json(filteredUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await usersDb.findOne({ _id: req.user.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// File transfer route
app.post('/api/transfer', authenticateToken, async (req, res) => {
  try {
    const { recipientId, fileName, fileSize, fileType, encryptedData } = req.body;
    
    // Validate input
    if (!recipientId || !fileName || !fileSize || !fileType || !encryptedData) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Get sender and recipient info
    const sender = await usersDb.findOne({ _id: req.user.userId });
    const recipient = await usersDb.findOne({ _id: recipientId });
    
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    const fileTransfer = {
      sender: req.user.userId,
      recipient: recipientId,
      fileName,
      fileSize,
      fileType,
      encryptedData,
      status: 'pending', // Start as pending
      transferDate: new Date(),
      progress: 0
    };

    const savedTransfer = await transfersDb.insert(fileTransfer);
    
    // Notify recipient about the transfer request
    io.to(recipientId).emit('fileTransferRequest', {
      id: savedTransfer._id,
      sender: sender.username,
      fileName,
      fileSize,
      fileType,
      transferDate: savedTransfer.transferDate
    });

    res.json({ 
      message: 'File transfer request sent', 
      transferId: savedTransfer._id 
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get file transfers
app.get('/api/transfers', authenticateToken, async (req, res) => {
  try {
    const transfers = await transfersDb.find({
      $or: [
        { sender: req.user.userId },
        { recipient: req.user.userId }
      ]
    });
    
    // Populate sender and recipient info
    const populatedTransfers = await Promise.all(transfers.map(async (transfer) => {
      const sender = await usersDb.findOne({ _id: transfer.sender });
      const recipient = await usersDb.findOne({ _id: transfer.recipient });
      
      return {
        ...transfer,
        sender: { 
          id: sender?._id,
          username: sender?.username, 
          email: sender?.email 
        },
        recipient: { 
          id: recipient?._id,
          username: recipient?.username, 
          email: recipient?.email 
        }
      };
    }));
    
    // Sort by transfer date (newest first)
    populatedTransfers.sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime());
    
    res.json(populatedTransfers);
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      
      // Join user to their own room
      socket.join(decoded.userId);
      connectedUsers.set(decoded.userId, socket.id);
      
      // Update user online status
      await usersDb.update({ _id: decoded.userId }, { $set: { 
        isOnline: true,
        lastSeen: new Date(),
        status: 'online'
      }});
      
      console.log(`User ${decoded.username} authenticated`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.disconnect();
    }
  });

  socket.on('acceptFileTransfer', async (transferId) => {
    try {
      const transfer = await transfersDb.findOne({ _id: transferId });
      if (transfer && transfer.recipient === socket.userId) {
        // Update transfer status to accepted
        await transfersDb.update({ _id: transferId }, { $set: { 
          status: 'accepted', 
          progress: 50 
        }});
        
        const sender = await usersDb.findOne({ _id: transfer.sender });
        
        // Notify sender
        io.to(transfer.sender).emit('transferAccepted', {
          transferId,
          recipient: socket.username
        });
        
        // Simulate file transfer progress
        let progress = 50;
        const progressInterval = setInterval(async () => {
          progress += 10;
          
          // Update progress in database
          await transfersDb.update({ _id: transferId }, { $set: { progress }});
          
          // Notify both users of progress
          io.to(transfer.sender).emit('progressUpdate', { transferId, progress });
          io.to(transfer.recipient).emit('progressUpdate', { transferId, progress });
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Mark as completed
            await transfersDb.update({ _id: transferId }, { $set: { 
              status: 'completed', 
              progress: 100 
            }});
            
            // Send encrypted file data to recipient
            socket.emit('fileData', {
              transferId,
              encryptedData: transfer.encryptedData,
              fileName: transfer.fileName,
              fileType: transfer.fileType
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error accepting transfer:', error);
    }
  });

  socket.on('rejectFileTransfer', async (transferId) => {
    try {
      const transfer = await transfersDb.findOne({ _id: transferId });
      if (transfer && transfer.recipient === socket.userId) {
        await transfersDb.update({ _id: transferId }, { $set: { 
          status: 'rejected',
          progress: 0
        }});
        
        // Notify sender
        io.to(transfer.sender).emit('transferRejected', {
          transferId,
          recipient: socket.username
        });
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
    }
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      await usersDb.update({ _id: socket.userId }, { $set: { 
        isOnline: false,
        lastSeen: new Date(),
        status: 'offline'
      }});
      console.log(`User ${socket.username} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Data directory: ${dataDir}`);
});