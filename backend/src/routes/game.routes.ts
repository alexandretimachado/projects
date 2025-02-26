import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const gameController = new GameController();

// Rotas protegidas (requer autenticação)
router.use(authMiddleware);

// Sessões de jogo
router.post('/sessions', gameController.createSession);
router.get('/sessions/:code', gameController.getSession);
router.post('/sessions/:code/join', gameController.joinSession);
router.post('/sessions/:code/start', gameController.startSession);
router.post('/sessions/:code/answer', gameController.submitAnswer);
router.post('/sessions/:code/end', gameController.endSession);

export default router; 