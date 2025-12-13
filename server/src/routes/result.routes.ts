import { Router } from 'express';
import { createResult, updateResult } from '../controllers/result.controller';

const router = Router();

router.post('/', createResult);
router.put('/:id', updateResult);

export default router;
