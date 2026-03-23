import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_session', (sessionCode) => {
        socket.join(sessionCode);
        console.log(`Socket ${socket.id} joined session ${sessionCode}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('Vi-SlideS Core API is running');
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
