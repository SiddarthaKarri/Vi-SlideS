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

    let currentRoom: string | null = null;

    socket.on('join_session', (sessionCode) => {
        socket.join(sessionCode);
        currentRoom = sessionCode;
        console.log(`Socket ${socket.id} joined session ${sessionCode}`);
        
        const roomSize = io.sockets.adapter.rooms.get(sessionCode)?.size || 0;
        io.to(sessionCode).emit('member_count', roomSize);
    });

    socket.on('send_question', (data) => {
        console.log(`Question received for session ${data.sessionCode}`);
        io.to(data.sessionCode).emit('receive_question', {
            id: Date.now().toString(),
            question: data.question,
            isAnonymous: data.isAnonymous,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (currentRoom) {
            const roomSize = io.sockets.adapter.rooms.get(currentRoom)?.size || 0;
            io.to(currentRoom).emit('member_count', roomSize);
        }
    });
});

app.get('/', (req, res) => {
    res.send('Vi-SlideS Core API is running');
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
