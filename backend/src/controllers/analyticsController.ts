import { Request, Response } from 'express';
import Question from '../models/Question';
import Session from '../models/Session';

export const getSessionAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionCode } = req.params;
        
        const totalQuestions = await Question.countDocuments({ sessionCode });
        const autoAnswered = await Question.countDocuments({ sessionCode, status: 'answered_ai' });
        
        const complexityStats = await Question.aggregate([
            { $match: { sessionCode } },
            { $group: { _id: null, avgComplexity: { $avg: '$complexity' } } }
        ]);

        const avgComplexity = complexityStats.length > 0 ? parseFloat(complexityStats[0].avgComplexity.toFixed(1)) : 0;

        res.json({
            sessionCode,
            totalQuestions,
            autoAnswered,
            teacherAnswered: totalQuestions - autoAnswered,
            avgComplexity
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Error retrieving metrics' });
    }
};
