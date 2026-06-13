import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999); // End of 3rd day

        // 1. Stats
        const totalOlympiads = await prisma.olympiad.count();

        // Fetch only active stages (that overlap with today) to calculate detailed current stats
        const activeStages = await prisma.stage.findMany({
            where: {
                startDate: { lte: today },
                endDate: { gte: today }
            },
            include: {
                results: {
                    select: {
                        status: true
                    }
                }
            }
        });

        let onRegistration = 0;
        let qualifying = 0;
        let finals = 0;

        const qualifyingKeywords = ['отборочный', 'муниципальный', 'школьный', 'первый этап', 'второй этап'];
        const finalKeywords = ['заключительный', 'финал'];

        const activeProfileIds = new Set<number>();
        for (const stage of activeStages) {
            activeProfileIds.add(stage.profileId);

            const stageName = stage.name.toLowerCase();
            const isCompleted = stage.results.some(r => ['completed', 'выполнено'].includes(r.status.toLowerCase()));

            if (stageName.includes('регистрация') || stageName.includes('registration')) {
                if (!isCompleted) {
                    onRegistration++;
                }
            } else if (qualifyingKeywords.some(k => stageName.includes(k))) {
                qualifying++;
            } else if (finalKeywords.some(k => stageName.includes(k))) {
                finals++;
            }
        }
        const currentOlympiads = activeProfileIds.size;

        // Fetch only status and stage name for result stats calculation
        const allResults = await prisma.result.findMany({
            where: {
                status: { in: ['Participant', 'Winner', 'PrizeWinner', 'Waiting', 'Участник', 'Победитель', 'Призер', 'Ожидание'] }
            },
            select: {
                status: true,
                stage: {
                    select: {
                        name: true
                    }
                }
            }
        });

        const isFinalStage = (name: string) => {
            const n = name.toLowerCase();
            return n.includes('заключительн') || n.includes('финал') || n.includes('final');
        };

        const stats = {
            totalOlympiads,
            currentOlympiads,
            onRegistration,
            qualifying,
            finals,
            results: {
                participant: allResults.filter(r => ['Participant', 'Участник'].includes(r.status)).length,
                participantFinal: allResults.filter(r => ['Participant', 'Участник'].includes(r.status) && isFinalStage(r.stage.name)).length,
                prize: allResults.filter(r => ['PrizeWinner', 'Призер'].includes(r.status)).length,
                prizeFinal: allResults.filter(r => ['PrizeWinner', 'Призер'].includes(r.status) && isFinalStage(r.stage.name)).length,
                winner: allResults.filter(r => ['Winner', 'Победитель'].includes(r.status)).length,
                winnerFinal: allResults.filter(r => ['Winner', 'Победитель'].includes(r.status) && isFinalStage(r.stage.name)).length,
                waiting: allResults.filter(r => ['Waiting', 'Ожидание'].includes(r.status)).length,
            }
        };

        // 2. Alerts (Action Required)
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
            take: 5,
            orderBy: {
                startDate: 'asc'
            }
        });

        // 3. Events (Calendar)
        const events = await prisma.stage.findMany({
            include: {
                profile: {
                    include: {
                        olympiad: true
                    }
                },
                results: true
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        res.json({
            stats,
            alerts: alerts.map(stage => ({
                id: stage.profile.olympiad.id,
                type: stage.regDeadline && new Date(stage.regDeadline) <= threeDaysFromNow && new Date(stage.regDeadline) >= today ? 'Registration' : 'Event',
                olympiadName: stage.profile.olympiad.name,
                subject: stage.profile.subject,
                stageName: stage.name,
                date: stage.regDeadline || stage.startDate,
                isStart: stage.startDate && new Date(stage.startDate) >= today && new Date(stage.startDate) <= threeDaysFromNow
            })),
            upcoming: events.map(stage => ({
                id: stage.profile.olympiad.id,
                olympiadName: stage.profile.olympiad.name,
                subject: stage.profile.subject,
                stageName: stage.name,
                startDate: stage.startDate,
                endDate: stage.endDate,
                status: stage.results.length > 0 ? stage.results[0].status : null
            }))
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
