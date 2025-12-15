import { Router } from 'express';
import multer from 'multer';
import { exportOlympiads } from '../controllers/export.controller';
import { importOlympiads } from '../controllers/import.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/export', exportOlympiads);
router.post('/import', upload.single('file'), importOlympiads);

export default router;
