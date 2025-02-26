import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class QuizController {
  async create(req: Request, res: Response) {
    try {
      const { title, description, isPublic } = req.body;
      const userId = req.user?.id;

      const quiz = await prisma.quiz.create({
        data: {
          title,
          description,
          isPublic,
          ownerId: userId!
        }
      });

      return res.status(201).json(quiz);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { isPublic } = req.query;

      const quizzes = await prisma.quiz.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { isPublic: isPublic === 'true' }
          ]
        },
        include: {
          questions: {
            include: {
              options: true
            }
          }
        }
      });

      return res.json(quizzes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const quiz = await prisma.quiz.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            { isPublic: true }
          ]
        },
        include: {
          questions: {
            include: {
              options: true
            }
          }
        }
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }

      return res.json(quiz);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { title, description, isPublic } = req.body;

      const quiz = await prisma.quiz.findFirst({
        where: {
          id,
          ownerId: userId
        }
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }

      const updatedQuiz = await prisma.quiz.update({
        where: { id },
        data: {
          title,
          description,
          isPublic
        }
      });

      return res.json(updatedQuiz);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const quiz = await prisma.quiz.findFirst({
        where: {
          id,
          ownerId: userId
        }
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }

      await prisma.quiz.delete({
        where: { id }
      });

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addQuestion(req: Request, res: Response) {
    try {
      const { quizId } = req.params;
      const userId = req.user?.id;
      const { content, type, timeLimit, points, options } = req.body;

      const quiz = await prisma.quiz.findFirst({
        where: {
          id: quizId,
          ownerId: userId
        }
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }

      // Conta o número atual de questões para definir a ordem
      const questionsCount = await prisma.question.count({
        where: { quizId }
      });

      const question = await prisma.question.create({
        data: {
          content,
          type,
          timeLimit,
          points,
          order: questionsCount + 1,
          quizId,
          options: {
            create: options
          }
        },
        include: {
          options: true
        }
      });

      return res.status(201).json(question);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateQuestion(req: Request, res: Response) {
    try {
      const { quizId, questionId } = req.params;
      const userId = req.user?.id;
      const { content, type, timeLimit, points, options } = req.body;

      const quiz = await prisma.quiz.findFirst({
        where: {
          id: quizId,
          ownerId: userId
        }
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }

      // Atualiza a questão e suas opções
      const question = await prisma.question.update({
        where: { id: questionId },
        data: {
          content,
          type,
          timeLimit,
          points,
          options: {
            deleteMany: {},
            create: options
          }
        },
        include: {
          options: true
        }
      });

      return res.json(question);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deleteQuestion(req: Request, res: Response) {
    try {
      const { quizId, questionId } = req.params;
      const userId = req.user?.id;

      const quiz = await prisma.quiz.findFirst({
        where: {
          id: quizId,
          ownerId: userId
        }
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }

      await prisma.question.delete({
        where: { id: questionId }
      });

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 