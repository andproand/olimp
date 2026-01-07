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

        // Fetch all profiles to calculate detailed current stats
        const allProfiles = await prisma.profile.findMany({
            include: {
                stages: {
                    include: {
                        results: true
                    }
                }
            }
        });

        let currentOlympiads = 0;
        let onRegistration = 0;
        let qualifying = 0;
        let finals = 0;

        const qualifyingKeywords = ['отборочный', 'муниципальный', 'школьный', 'первый этап', 'второй этап'];
        const finalKeywords = ['заключительный', 'финал'];

        for (const profile of allProfiles) {
            // Find active stage
            const activeStage = profile.stages.find(s => {
                if (!s.startDate || !s.endDate) return false;
                const start = new Date(s.startDate);
                const end = new Date(s.endDate);
                return start <= today && end >= today;
            });

            if (activeStage) {
                currentOlympiads++; // It has an active stage

                const stageName = activeStage.name.toLowerCase();
                const hasResult = activeStage.results.length > 0;
                // Assuming 'Выполнено' or 'Completed' status means we shouldn't count it as "active on registration" if specifically asked?
                // User said: "number on registration (if stage is not in status 'Completed')"
                // We check if there is a result with 'Completed' or 'Выполнено'
                const isCompleted = activeStage.results.some(r => ['completed', 'выполнено'].includes(r.status.toLowerCase()));

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
        }

        // Helper to count results
        // ... (rest of the code for results counting remains similar but we can reuse the fetched data if we want, but keeping existing logic for results is fine for now to minimize changes, though we can optimize)

        // Actually, let's keep the existing result counting logic as it was working fine, just adding the new stats.
        const allResults = await prisma.result.findMany({
            where: {
                status: { in: ['Participant', 'Winner', 'PrizeWinner', 'Waiting', 'Участник', 'Победитель', 'Призер', 'Ожидание'] }
            },
            include: {
                stage: true
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
