import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsername = async (req: Request, res: Response) => {
    try {
        const setting = await prisma.settings.findUnique({
            where: { key: 'username' }
        });
        res.json({ value: setting?.value || '' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch username' });
    }
};

export const setUsername = async (req: Request, res: Response) => {
    try {
        const { value } = req.body;
        const setting = await prisma.settings.upsert({
            where: { key: 'username' },
            update: { value },
            create: { key: 'username', value }
        });
        res.json(setting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save username' });
    }
};
