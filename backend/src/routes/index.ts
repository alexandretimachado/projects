import { Router } from 'express';
import authRoutes from './auth.routes';
import quizRoutes from './quiz.routes';
import gameRoutes from './game.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/quiz', quizRoutes);
router.use('/game', gameRoutes);

export default router; 