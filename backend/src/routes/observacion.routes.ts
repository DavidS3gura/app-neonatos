import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getAll, create, getByNeonato } from '../controllers/observacion.controller';

const router = Router();
router.use(authMiddleware as any);
router.get('/', getAll as any);
router.post('/', create as any);
router.get('/neonato/:id', getByNeonato as any);
export default router;
