import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dashboardRoutes from './routes/dashboard.routes';
import olympiadRoutes from './routes/olympiad.routes';
import resultRoutes from './routes/result.routes';
import uploadRoutes from './routes/upload.routes';
import settingsRoutes from './routes/settings.routes';
import dataRoutes from './routes/data.routes';
import path from 'path';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/olympiads', olympiadRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/data', dataRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'OlympTracker Server is running' });
});

// Test DB Connection
app.get('/api/db-check', async (req, res) => {
    try {
        const count = await prisma.olympiad.count();
        res.json({ status: 'ok', count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database connection failed', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
