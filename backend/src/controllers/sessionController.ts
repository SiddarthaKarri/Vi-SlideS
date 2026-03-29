import { Request, Response } from 'express';
import Session from '../models/Session';
import { mockStore } from '../services/MockStorage.service';

// @route POST /api/sessions
// @desc Create a new active session
export const createSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId } = req.body;
        const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        if (process.env.USE_MOCK_DB === 'true') {
            const session = await mockStore.createSession({ teacherId, sessionCode, isActive: true });
            res.status(201).json(session);
            return;
        }

        const session = await Session.create({
            teacherId,
            sessionCode,
            isActive: true,
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error creating session' });
    }
};

// @route POST /api/sessions/join
// @desc Join an existing session via code
export const joinSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionCode } = req.body;

        if (process.env.USE_MOCK_DB === 'true') {
            const session = await mockStore.findSessionByCode(sessionCode);
            if (!session) {
                res.status(404).json({ message: 'Session not found or inactive' });
                return;
            }
            res.status(200).json(session);
            return;
        }

        const session = await Session.findOne({ sessionCode, isActive: true });

        if (!session) {
            res.status(404).json({ message: 'Session not found or inactive' });
            return;
        }

        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error joining session' });
    }
};
