import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getOlympiads = async (req: Request, res: Response) => {
    try {
        const olympiads = await prisma.olympiad.findMany({
            include: {
                profiles: {
                    include: {
                        stages: {
                            include: {
                                results: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        res.json(olympiads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch olympiads' });
    }
};

export const getOlympiadById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const olympiad = await prisma.olympiad.findUnique({
            where: { id: Number(id) },
            include: {
                profiles: {
                    include: {
                        stages: {
                            include: {
                                results: true
                            }
                        }
                    }
                }
            }
        });
        if (!olympiad) {
            return res.status(404).json({ error: 'Olympiad not found' });
        }
        res.json(olympiad);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch olympiad' });
    }
};

export const createOlympiad = async (req: Request, res: Response) => {
    console.log('Received body:', req.body);
    const { name, organizer, website, description, contacts, profiles } = req.body;
    try {
        const olympiad = await prisma.olympiad.create({
            data: {
                name,
                organizer,
                website,
                description,
                contacts,
                login: req.body.login,
                password: req.body.password,
                priority: 'Medium',
                profiles: {
                    create: (profiles || []).map((p: any) => ({
                        subject: p.subject,
                        level: (p.level && p.level !== '-' && !isNaN(Number(p.level))) ? Number(p.level) : null,
                        description: p.description || null,
                        priority: p.priority || 'Medium',
                        academicYear: p.academicYear || '2025/2026',
                        stages: {
                            create: (p.stages || []).map((s: any) => ({
                                name: s.name,
                                type: s.type || 'Offline',
                                time: s.time || null,
                                startDate: (s.startDate && s.startDate !== '') ? new Date(s.startDate) : null,
                                endDate: (s.endDate && s.endDate !== '') ? new Date(s.endDate) : null,
                                regDeadline: (s.regDeadline && s.regDeadline !== '') ? new Date(s.regDeadline) : null,
                            }))
                        }
                    }))
                }
            },
            include: {
                profiles: {
                    include: {
                        stages: true
                    }
                }
            }
        });
        res.json(olympiad);
    } catch (error: any) {
        console.error('Create Error:', error);
        res.status(500).json({
            error: 'Failed to create olympiad',
            details: error.message,
            meta: error.meta
        });
    }
};

export const updateOlympiad = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, organizer, website, description, contacts, profiles, login, password } = req.body;
    try {
        // 1. Update basic info
        const olympiad = await prisma.olympiad.update({
            where: { id: Number(id) },
            data: {
                name,
                organizer,
                website,
                description,
                contacts,
                login,
                password
            },
            include: {
                profiles: {
                    include: {
                        stages: true
                    }
                }
            }
        });

        // 2. Handle Profiles Deletion
        // Get IDs of profiles currently in DB
        const existingProfileIds = olympiad.profiles.map(p => p.id);
        // Get IDs of profiles in the request
        const requestProfileIds = (profiles || [])
            .filter((p: any) => p.id)
            .map((p: any) => Number(p.id));

        // Delete profiles that are not in the request
        const profilesToDelete = existingProfileIds.filter(pid => !requestProfileIds.includes(pid));
        if (profilesToDelete.length > 0) {
            await prisma.profile.deleteMany({
                where: { id: { in: profilesToDelete } }
            });
        }

        // 3. Handle Profiles & Stages (Upsert Logic)
        if (profiles && Array.isArray(profiles)) {
            for (const p of profiles) {
                if (p.id) {
                    // Update existing profile
                    await prisma.profile.update({
                        where: { id: Number(p.id) },
                        data: {
                            subject: p.subject,
                            level: (p.level && p.level !== '-' && !isNaN(Number(p.level))) ? Number(p.level) : null,
                            description: p.description,
                            priority: p.priority,
                            academicYear: p.academicYear
                        }
                    });

                    // Handle Stages Deletion for this profile
                    const currentProfile = await prisma.profile.findUnique({
                        where: { id: Number(p.id) },
                        include: { stages: true }
                    });

                    if (currentProfile) {
                        const existingStageIds = currentProfile.stages.map(s => s.id);
                        const requestStageIds = (p.stages || [])
                            .filter((s: any) => s.id)
                            .map((s: any) => Number(s.id));

                        const stagesToDelete = existingStageIds.filter(sid => !requestStageIds.includes(sid));
                        if (stagesToDelete.length > 0) {
                            await prisma.stage.deleteMany({
                                where: { id: { in: stagesToDelete } }
                            });
                        }
                    }

                    // Handle Stages Upsert
                    if (p.stages && Array.isArray(p.stages)) {
                        for (const s of p.stages) {
                            if (s.id) {
                                // Update stage
                                await prisma.stage.update({
                                    where: { id: Number(s.id) },
                                    data: {
                                        name: s.name,
                                        type: s.type,
                                        time: s.time || null,
                                        startDate: (s.startDate && s.startDate !== '') ? new Date(s.startDate) : null,
                                        endDate: (s.endDate && s.endDate !== '') ? new Date(s.endDate) : null,
                                        regDeadline: (s.regDeadline && s.regDeadline !== '') ? new Date(s.regDeadline) : null,
                                    }
                                });
                            } else {
                                // Create new stage
                                await prisma.stage.create({
                                    data: {
                                        name: s.name,
                                        type: s.type,
                                        time: s.time || null,
                                        startDate: (s.startDate && s.startDate !== '') ? new Date(s.startDate) : null,
                                        endDate: (s.endDate && s.endDate !== '') ? new Date(s.endDate) : null,
                                        regDeadline: (s.regDeadline && s.regDeadline !== '') ? new Date(s.regDeadline) : null,
                                        profileId: Number(p.id)
                                    }
                                });
                            }
                        }
                    }
                } else {
                    // Create new profile
                    await prisma.profile.create({
                        data: {
                            subject: p.subject,
                            level: (p.level && p.level !== '-' && !isNaN(Number(p.level))) ? Number(p.level) : null,
                            description: p.description || null,
                            priority: p.priority || 'Medium',
                            academicYear: p.academicYear || '2025/2026',
                            olympiadId: Number(id),
                            stages: {
                                create: (p.stages || []).map((s: any) => ({
                                    name: s.name,
                                    type: s.type || 'Offline',
                                    time: s.time || null,
                                    startDate: (s.startDate && s.startDate !== '') ? new Date(s.startDate) : null,
                                    endDate: (s.endDate && s.endDate !== '') ? new Date(s.endDate) : null,
                                    regDeadline: (s.regDeadline && s.regDeadline !== '') ? new Date(s.regDeadline) : null,
                                }))
                            }
                        }
                    });
                }
            }
        }

        res.json(olympiad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update olympiad' });
    }
};

export const deleteOlympiad = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.olympiad.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Olympiad deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete olympiad' });
    }
};
