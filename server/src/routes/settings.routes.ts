import { Router } from 'express';
import { getUsername, setUsername } from '../controllers/settings.controller';

const router = Router();

router.get('/username', getUsername);
router.post('/username', setUsername);

export default router;
