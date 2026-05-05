/**
 * CITYMED BACKEND - MAIN ENTRY POINT
 */
require('dotenv').config(); 
const express = require('express');
const http = require('http'); 
const cors = require('cors');
const { Server } = require('socket.io'); 
const mongoose = require('mongoose');

// --- DATABASE & MODELS ---
const connectToDatabase = require('./config/database');
const Message = require('./models/Message'); 

const app = express();
const server = http.createServer(app); 

// --- MIDDLEWARE ---
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true 
}));

app.use(express.json());

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('User connected to chat:', socket.id);
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
    });
    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, text, senderModel } = data;
        try {
            const newMessage = new Message({ senderId, senderModel, text });
            await newMessage.save();
            io.to(receiverId).emit('newMessage', { ...newMessage._doc, playChime: true });
        } catch (err) { console.error("Socket Message Error:", err); }
    });
});

// --- ROUTE MAPPING ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/receptionist', require('./routes/receptionistRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// --- SERVER INITIALIZATION ---
async function startServer() {
    try {
        await connectToDatabase();
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`✅ CityMed API & Real-time Server active on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Critical Startup Failure:', err.message);
        process.exit(1);
    }
}

startServer();