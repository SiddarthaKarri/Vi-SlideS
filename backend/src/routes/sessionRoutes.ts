import express from 'express';
import { createSession, joinSession } from '../controllers/sessionController';

const router = express.Router();

router.post('/', createSession);
router.post('/join', joinSession);

export default router;
