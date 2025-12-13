import { Router } from 'express';
import { getOlympiads, getOlympiadById, createOlympiad, updateOlympiad, deleteOlympiad } from '../controllers/olympiad.controller';

const router = Router();

router.get('/', getOlympiads);
router.get('/:id', getOlympiadById);
router.post('/', createOlympiad);
router.put('/:id', updateOlympiad);
router.delete('/:id', deleteOlympiad);

export default router;
