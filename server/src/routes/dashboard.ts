import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        // 1. Stats
        const totalOlympiads = await prisma.olympiad.count();
        const totalWins = await prisma.result.count({
            where: {
                status: { in: ['Winner', 'Prize-winner'] }
            }
        });

        // 2. Alerts (Action Required)
        // Stages where regDeadline is approaching (within 3 days) and not passed
        const alerts = await prisma.stage.findMany({
            where: {
                OR: [
                    {
                        regDeadline: {
                            gte: today,
                            lte: threeDaysFromNow
                        }
                    },
                    {
                        // Or maybe stages starting soon? Let's stick to regDeadline for now as per plan
                        startDate: {
                            gte: today,
                            lte: threeDaysFromNow
                        }
                    }
                ]
            },
            include: {
                profile: {
                    include: {
                        olympiad: true
                    }
                }
            },
            take: 5
        });

        // 3. Upcoming Events
        const upcoming = await prisma.stage.findMany({
            where: {
                startDate: {
                    gte: today
                }
            },
            orderBy: {
                startDate: 'asc'
            },
            take: 5,
            include: {
                profile: {
                    include: {
                        olympiad: true
                    }
                }
            }
        });

        res.json({
            stats: {
                totalOlympiads,
                totalWins
            },
            alerts: alerts.map(stage => ({
                id: stage.id,
                type: stage.regDeadline && new Date(stage.regDeadline) <= threeDaysFromNow ? 'Registration' : 'Event',
                olympiadName: stage.profile.olympiad.name,
                subject: stage.profile.subject,
                stageName: stage.name,
                date: stage.regDeadline || stage.startDate
            })),
            upcoming: upcoming.map(stage => ({
                id: stage.id,
                olympiadName: stage.profile.olympiad.name,
                subject: stage.profile.subject,
                stageName: stage.name,
                startDate: stage.startDate,
                endDate: stage.endDate
            }))
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
