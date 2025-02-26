import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateGameCode } from '../utils/gameCode';

const prisma = new PrismaClient();

export class GameController {
  async createSession(req: Request, res: Response) {
    try {
      const { quizId } = req.body;
      const userId = req.user?.id;

      // Verifica se o quiz existe e pertence ao usuário
      const quiz = await prisma.quiz.findFirst({
        where: {
          id: quizId,
          ownerId: userId
        }
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }

      // Gera um código único para a sessão
      const code = await generateGameCode();

      const session = await prisma.gameSession.create({
        data: {
          quizId,
          code,
          status: 'WAITING'
        },
        include: {
          quiz: {
            include: {
              questions: {
                include: {
                  options: true
                }
              }
            }
          }
        }
      });

      return res.status(201).json(session);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const { code } = req.params;

      const session = await prisma.gameSession.findUnique({
        where: { code },
        include: {
          quiz: {
            include: {
              questions: {
                include: {
                  options: true
                }
              }
            }
          },
          participants: {
            select: {
              id: true,
              name: true
            }
          },
          scores: true
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      return res.json(session);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async joinSession(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const userId = req.user?.id;

      const session = await prisma.gameSession.findUnique({
        where: { code }
      });

      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      if (session.status !== 'WAITING') {
        return res.status(400).json({ error: 'Sessão já iniciada ou finalizada' });
      }

      // Adiciona o participante à sessão
      await prisma.gameSession.update({
        where: { code },
        data: {
          participants: {
            connect: { id: userId }
          }
        }
      });

      return res.status(200).json({ message: 'Participante adicionado com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async startSession(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const userId = req.user?.id;

      const session = await prisma.gameSession.findFirst({
        where: {
          code,
          quiz: {
            ownerId: userId
          }
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      if (session.status !== 'WAITING') {
        return res.status(400).json({ error: 'Sessão já iniciada ou finalizada' });
      }

      const updatedSession = await prisma.gameSession.update({
        where: { code },
        data: {
          status: 'ACTIVE',
          startedAt: new Date()
        }
      });

      return res.json(updatedSession);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async submitAnswer(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const userId = req.user?.id;
      const { questionId, selectedOption } = req.body;

      const session = await prisma.gameSession.findFirst({
        where: {
          code,
          status: 'ACTIVE',
          participants: {
            some: {
              id: userId
            }
          }
        },
        include: {
          quiz: {
            include: {
              questions: {
                include: {
                  options: true
                }
              }
            }
          }
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada ou inválida' });
      }

      // Verifica se a questão pertence ao quiz
      const question = session.quiz.questions.find(q => q.id === questionId);
      if (!question) {
        return res.status(404).json({ error: 'Questão não encontrada' });
      }

      // Registra a resposta
      const answer = await prisma.answer.create({
        data: {
          sessionId: session.id,
          questionId,
          userId: userId!,
          selectedOption
        }
      });

      // Calcula e atualiza a pontuação
      const isCorrect = question.options.find(opt => opt.id === selectedOption)?.isCorrect || false;
      const points = isCorrect ? question.points : 0;

      await prisma.score.upsert({
        where: {
          sessionId_userId: {
            sessionId: session.id,
            userId: userId!
          }
        },
        update: {
          points: {
            increment: points
          }
        },
        create: {
          sessionId: session.id,
          userId: userId!,
          points
        }
      });

      return res.json({ answer, points });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async endSession(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const userId = req.user?.id;

      const session = await prisma.gameSession.findFirst({
        where: {
          code,
          quiz: {
            ownerId: userId
          }
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      if (session.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Sessão não está ativa' });
      }

      const updatedSession = await prisma.gameSession.update({
        where: { code },
        data: {
          status: 'FINISHED',
          endedAt: new Date()
        },
        include: {
          scores: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              points: 'desc'
            }
          }
        }
      });

      return res.json(updatedSession);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 