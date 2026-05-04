/**
 * CITYMED BACKEND - MAIN ENTRY POINT
 * This file initializes the Express application, connects to MongoDB,
 * and maps the API endpoints to their respective route files.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectToDatabase = require('./config/database');

const app = express();

// --- MIDDLEWARE ---

// Standard CORS setup to allow the React frontend to communicate with the API
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));

// Built-in Express parser to handle JSON data in request bodies
app.use(express.json());

// --- ROUTE MAPPING ---

// Auth & Security
app.use('/api/auth', require('./routes/authRoutes'));

// Business Modules - Divided by Actor/Resource
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/receptionist', require('./routes/receptionistRoutes'));

// Shared Resources (Queue/Booking)
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// System Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        uptime: `${Math.floor(process.uptime())}s`,
        timestamp: new Date().toISOString()
    });
});

// --- SERVER INITIALIZATION ---

/**
 * Ensures the database connection is established before the server 
 * starts listening for incoming requests.
 */
async function startServer() {
    try {
        await connectToDatabase();
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`✅ CityMed API active on port ${PORT}`);
            console.log(`📍 Patient Portal: /api/patients`);
            console.log(`📍 Auth System:    /api/auth`);
        });
    } catch (err) {
        console.error('❌ Critical Startup Failure:', err.message);
        process.exit(1);
    }
}

const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('User connected to chat');

    // Join a private room so messages don't go to everyone
    socket.on('join', (userId) => {
        socket.join(userId);
    });

    // When a message is sent
    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, text, senderModel } = data;

        // 1. Save to Database
        const newMessage = new Message({ senderId, senderModel, text });
        await newMessage.save();

        // 2. Send to Receiver Instantly
        io.to(receiverId).emit('newMessage', {
            ...newMessage._doc,
            playChime: true // This flag tells the frontend to play chime.wav
        });
    });

    // When doctor opens the chat, mark all as read
    socket.on('markAsRead', async (receiverId) => {
        await Message.updateMany({ senderId: receiverId, status: 'sent' }, { status: 'read' });
        io.to(receiverId).emit('messagesRead');
    });
});
startServer();