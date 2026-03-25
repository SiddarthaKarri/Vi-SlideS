import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import aiRoutes from './routes/ai.routes';
import { analyzeQuestionPrompt } from './services/ai.service';
import Question from './models/Question';

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
// Sprint 3 Question route (GET)
app.get('/api/questions/:sessionCode', async (req, res) => {
    try {
        const questions = await Question.find({ sessionCode: req.params.sessionCode }).sort('-createdAt');
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
});

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

    socket.on('send_question', async (data) => {
        console.log(`Question received for session ${data.sessionCode}: ${data.question}`);

        try {
            // 1. Run Smart AI Triage using Member 4's service layer
            const analysis = await analyzeQuestionPrompt(data.question);
            const isAutoAnswerable = analysis && analysis.complexity <= 3;

            // 2. Save Question to Database (Member 3 CRUD Layer)
            const savedQuestion = await Question.create({
                sessionCode: data.sessionCode,
                question: data.question,
                isAnonymous: data.isAnonymous,
                complexity: analysis?.complexity || 5,
                category: analysis?.category || 'General',
                aiSuggestedAnswer: analysis?.suggestedAnswer || '',
                status: isAutoAnswerable ? 'answered_ai' : 'pending'
            });

            // 3. Smart Routing: Only broadcast complex questions to teacher's view!
            if (!isAutoAnswerable) {
                // Emits to everyone (Teacher receives this)
                io.to(data.sessionCode).emit('receive_question', {
                    id: savedQuestion._id.toString(),
                    question: savedQuestion.question,
                    isAnonymous: savedQuestion.isAnonymous,
                    complexity: savedQuestion.complexity,
                    timestamp: savedQuestion.createdAt
                });
            } else {
                // Strictly return auto-answer directly back to the student who asked
                socket.emit('auto_answer', {
                    questionId: savedQuestion._id.toString(),
                    question: data.question,
                    answer: analysis.suggestedAnswer
                });
            }
        } catch (error) {
            console.error('Error processing question via socket:', error);
        }
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
