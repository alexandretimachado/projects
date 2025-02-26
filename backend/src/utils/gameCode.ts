import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Gera um código aleatório de 6 caracteres
const generateRandomCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Gera um código único verificando se já existe no banco
export const generateGameCode = async (): Promise<string> => {
  let code: string;
  let existingSession;

  do {
    code = generateRandomCode();
    existingSession = await prisma.gameSession.findUnique({
      where: { code }
    });
  } while (existingSession);

  return code;
}; 