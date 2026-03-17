import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getAll, getById, getByCode, create, update } from '../controllers/neonato.controller';

const router = Router();
router.use(authMiddleware as any);
router.get('/', getAll as any);
router.get('/code/:code', getByCode as any);
router.get('/:id', getById as any);
router.post('/', create as any);
router.put('/:id', update as any);
export default router;
