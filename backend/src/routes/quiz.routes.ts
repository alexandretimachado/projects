import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const quizController = new QuizController();

// Rotas protegidas (requer autenticação)
router.use(authMiddleware);

// CRUD Quiz
router.post('/', quizController.create);
router.get('/', quizController.list);
router.get('/:id', quizController.getById);
router.put('/:id', quizController.update);
router.delete('/:id', quizController.delete);

// Questões
router.post('/:quizId/questions', quizController.addQuestion);
router.put('/:quizId/questions/:questionId', quizController.updateQuestion);
router.delete('/:quizId/questions/:questionId', quizController.deleteQuestion);

export default router; 