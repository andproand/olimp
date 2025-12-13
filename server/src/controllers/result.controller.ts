import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createResult = async (req: Request, res: Response) => {
    const { userScore, passingScore, status, diplomaLink, stageId } = req.body;
    try {
        const result = await prisma.result.create({
            data: {
                userScore,
                passingScore,
                status,
                diplomaLink,
                stageId: Number(stageId)
            }
        });
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create result' });
    }
};

export const updateResult = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userScore, passingScore, status, diplomaLink } = req.body;
    try {
        const result = await prisma.result.update({
            where: { id: Number(id) },
            data: {
                userScore,
                passingScore,
                status,
                diplomaLink
            }
        });
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update result' });
    }
};
