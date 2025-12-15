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

        // Wins: Winner or PrizeWinner
        const totalWins = await prisma.result.count({
            where: {
                status: { in: ['Winner', 'PrizeWinner', 'Победитель', 'Призер'] } // Handle both English and potential Russian values if any
            }
        });

        // Current: Olympiads with at least one active stage
        const currentOlympiads = await prisma.olympiad.count({
            where: {
                profiles: {
                    some: {
                        stages: {
                            some: {
                                startDate: { lte: today },
                                endDate: { gte: today }
                            }
                        }
                    }
                }
            }
        });

        // Completed: Olympiads where ALL stages are in the past
        // Note: This logic assumes an olympiad is "completed" only if it has stages and all are done.
        // If it has no stages, is it completed? Let's assume no.
        // Prisma 'every' returns true for empty lists, so we need to ensure it has stages.
        // Easier approximation: Total - (Current + Future).
        // But "Future" is hard to define perfectly.
        // Let's use a simpler query for "Completed":
        const completedOlympiads = await prisma.olympiad.count({
            where: {
                profiles: {
                    some: {
                        stages: {
                            some: {} // Ensure at least one stage exists
                        }
                    },
                    every: {
                        stages: {
                            every: {
                                endDate: { lt: today }
                            }
                        }
                    }
                }
            }
        });

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
        // Fetch all relevant events (past, current, future) for the calendar widget
        // The frontend filters them, but we can fetch a reasonable range or all active ones.
        // For now, let's fetch all stages to populate the calendar fully.
        const events = await prisma.stage.findMany({
            include: {
                profile: {
                    include: {
                        olympiad: true
                    }
                },
                results: true // Include results to show status
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        res.json({
            stats: {
                totalOlympiads,
                totalWins,
                currentOlympiads,
                completedOlympiads
            },
            alerts: alerts.map(stage => ({
                id: stage.profile.olympiad.id, // Link to Olympiad
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
                status: stage.results.length > 0 ? stage.results[0].status : null // Pass the result status
            }))
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
