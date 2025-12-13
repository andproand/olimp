import { Request, Response } from 'express';

export const uploadFile = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL relative to the server root
    // Assuming uploads are served from /uploads
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
};
