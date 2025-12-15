import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export const exportOlympiads = async (req: Request, res: Response) => {
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
            }
        });

        const data: any[] = [];

        olympiads.forEach(olympiad => {
            if (olympiad.profiles.length === 0) {
                // Export olympiad even if no profiles
                data.push({
                    'Olympiad Name': olympiad.name,
                    'Organizer': olympiad.organizer || '',
                    'Website': olympiad.website || '',
                    'Description': olympiad.description || '',
                    'Contacts': olympiad.contacts || '',
                    'Academic Year': '',
                    'Profile Subject': '',
                    'Profile Level': '',
                    'Profile Priority': '',
                    'Stage Name': '',
                    'Stage Type': '',
                    'Start Date': '',
                    'End Date': '',
                    'User Score': '',
                    'Passing Score': '',
                    'Status': '',
                    'Diploma Link': ''
                });
            } else {
                olympiad.profiles.forEach(profile => {
                    if (profile.stages.length === 0) {
                        data.push({
                            'Olympiad Name': olympiad.name,
                            'Organizer': olympiad.organizer || '',
                            'Website': olympiad.website || '',
                            'Description': olympiad.description || '',
                            'Contacts': olympiad.contacts || '',
                            'Academic Year': profile.academicYear,
                            'Profile Subject': profile.subject,
                            'Profile Level': profile.level || '-',
                            'Profile Priority': profile.priority || 'Medium',
                            'Stage Name': '',
                            'Stage Type': '',
                            'Start Date': '',
                            'End Date': '',
                            'User Score': '',
                            'Passing Score': '',
                            'Status': '',
                            'Diploma Link': ''
                        });
                    } else {
                        profile.stages.forEach(stage => {
                            const result = stage.results?.[0]; // Assuming one result per stage for now
                            data.push({
                                'Olympiad Name': olympiad.name,
                                'Organizer': olympiad.organizer || '',
                                'Website': olympiad.website || '',
                                'Description': olympiad.description || '',
                                'Contacts': olympiad.contacts || '',
                                'Academic Year': profile.academicYear,
                                'Profile Subject': profile.subject,
                                'Profile Level': profile.level || '-',
                                'Profile Priority': profile.priority || 'Medium',
                                'Stage Name': stage.name,
                                'Stage Type': stage.type,
                                'Start Date': stage.startDate ? new Date(stage.startDate).toLocaleDateString('ru-RU') : '',
                                'End Date': stage.endDate ? new Date(stage.endDate).toLocaleDateString('ru-RU') : '',
                                'User Score': result?.userScore || '',
                                'Passing Score': result?.passingScore || '',
                                'Status': result?.status || 'Participant',
                                'Diploma Link': result?.diplomaLink || ''
                            });
                        });
                    }
                });
            }
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Set column widths
        const wscols = [
            { wch: 20 }, // Name
            { wch: 15 }, // Organizer
            { wch: 20 }, // Website
            { wch: 20 }, // Desc
            { wch: 15 }, // Contacts
            { wch: 12 }, // Year
            { wch: 15 }, // Subject
            { wch: 10 }, // Level
            { wch: 10 }, // Priority
            { wch: 15 }, // Stage
            { wch: 10 }, // Type
            { wch: 12 }, // Start
            { wch: 12 }, // End
            { wch: 10 }, // User Score
            { wch: 10 }, // Passing Score
            { wch: 15 }, // Status
            { wch: 20 }, // Diploma
        ];
        ws['!cols'] = wscols;

        // Add Data Validation (Dropdowns) - Note: SheetJS Pro feature, but we can try basic validation or just leave it as plain text for now.
        // Free version of SheetJS has limited support for writing validation. We will skip validation for now and rely on user input.

        XLSX.utils.book_append_sheet(wb, ws, 'Olympiads');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="olympiads_backup.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to export data' });
    }
};
