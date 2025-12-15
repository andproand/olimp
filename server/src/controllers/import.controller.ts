import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface ImportRow {
    'Academic Year'?: string;
    'Olympiad Name': string;
    'Organizer'?: string;
    'Website'?: string;
    'Description'?: string;
    'Contacts'?: string;
    'Profile Subject'?: string;
    'Profile Level'?: string | number;
    'Profile Priority'?: string;
    'Stage Name'?: string;
    'Stage Type'?: string;
    'Start Date'?: string;
    'End Date'?: string;
    'User Score'?: number | string;
    'Passing Score'?: number | string;
    'Status'?: string;
    'Diploma Link'?: string;
}

export const importOlympiads = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data: ImportRow[] = XLSX.utils.sheet_to_json(sheet);

        let createdCount = 0;
        let updatedCount = 0;

        for (const row of data) {
            const olympiadName = row['Olympiad Name'];
            if (!olympiadName) continue;

            // 1. Find or Create Olympiad
            let olympiad = await prisma.olympiad.findFirst({
                where: { name: olympiadName }
            });

            if (!olympiad) {
                olympiad = await prisma.olympiad.create({
                    data: {
                        name: olympiadName,
                        organizer: row['Organizer'] || null,
                        website: row['Website'] || null,
                        description: row['Description'] || null,
                        contacts: row['Contacts'] || null,
                        // Priority is now on Profile, but we keep the field for compatibility if needed, or ignore
                        priority: 'Medium'
                    }
                });
                createdCount++;
            } else {
                // Update basic info if provided and empty in DB? Or overwrite? 
                // Let's overwrite if provided in Excel to allow updates
                await prisma.olympiad.update({
                    where: { id: olympiad.id },
                    data: {
                        organizer: row['Organizer'] || olympiad.organizer,
                        website: row['Website'] || olympiad.website,
                        description: row['Description'] || olympiad.description,
                        contacts: row['Contacts'] || olympiad.contacts
                    }
                });
                updatedCount++;
            }

            // 2. Handle Profile
            const subject = row['Profile Subject'];
            if (subject) {
                const academicYear = row['Academic Year'] || '2025/2026';

                let profile = await prisma.profile.findFirst({
                    where: {
                        olympiadId: olympiad.id,
                        subject: subject,
                        academicYear: academicYear
                    }
                });

                if (!profile) {
                    const levelStr = row['Profile Level'] ? String(row['Profile Level']) : null;
                    const level = (levelStr && levelStr !== '-') ? parseInt(levelStr) : null;

                    profile = await prisma.profile.create({
                        data: {
                            olympiadId: olympiad.id,
                            subject: subject,
                            academicYear: academicYear,
                            level: isNaN(Number(level)) ? null : level,
                            priority: row['Profile Priority'] || 'Medium',
                            description: ''
                        }
                    });
                } else {
                    const levelStr = row['Profile Level'] ? String(row['Profile Level']) : null;
                    const level = (levelStr && levelStr !== '-') ? parseInt(levelStr) : null;

                    await prisma.profile.update({
                        where: { id: profile.id },
                        data: {
                            level: isNaN(Number(level)) ? profile.level : level,
                            priority: row['Profile Priority'] || profile.priority
                        }
                    });
                }

                // 3. Handle Stage
                const stageName = row['Stage Name'];
                if (stageName) {
                    let stage = await prisma.stage.findFirst({
                        where: {
                            profileId: profile.id,
                            name: stageName
                        }
                    });

                    const startDate = parseDate(row['Start Date']);
                    const endDate = parseDate(row['End Date']);

                    if (!stage) {
                        stage = await prisma.stage.create({
                            data: {
                                profileId: profile.id,
                                name: stageName,
                                type: row['Stage Type'] || 'Offline',
                                startDate: startDate,
                                endDate: endDate
                            }
                        });
                    } else {
                        await prisma.stage.update({
                            where: { id: stage.id },
                            data: {
                                type: row['Stage Type'] || stage.type,
                                startDate: startDate || stage.startDate,
                                endDate: endDate || stage.endDate
                            }
                        });
                    }

                    // 4. Handle Result
                    // Only if status or scores are present
                    if (row['Status'] || row['User Score'] || row['Passing Score']) {
                        const resultData = {
                            userScore: row['User Score'] ? parseFloat(String(row['User Score'])) : null,
                            passingScore: row['Passing Score'] ? parseFloat(String(row['Passing Score'])) : null,
                            status: row['Status'] || 'Participant',
                            diplomaLink: row['Diploma Link'] || null
                        };

                        const existingResult = await prisma.result.findFirst({
                            where: { stageId: stage.id }
                        });

                        if (existingResult) {
                            await prisma.result.update({
                                where: { id: existingResult.id },
                                data: resultData
                            });
                        } else {
                            await prisma.result.create({
                                data: {
                                    stageId: stage.id,
                                    ...resultData
                                }
                            });
                        }
                    }
                }
            }
        }

        // Cleanup uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ message: 'Import successful', created: createdCount, updated: updatedCount });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to import data' });
    }
};

function parseDate(dateStr?: string): string | null {
    if (!dateStr) return null;
    // Handle Excel serial date if passed as number? 
    // Usually sheet_to_json converts to string if raw:false (default)
    // Assuming DD.MM.YYYY format
    const parts = dateStr.split('.');
    if (parts.length === 3) {
        // DD.MM.YYYY -> YYYY-MM-DD
        return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00.000Z`;
    }
    return null;
}
