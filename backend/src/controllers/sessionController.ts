import { Request, Response } from 'express';
import Session from '../models/Session';

// @route POST /api/sessions
// @desc Create a new active session
export const createSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId } = req.body;

        // Generate a random 6 character alphanumeric code
        const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

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
