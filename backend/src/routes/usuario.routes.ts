import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { getAll, create, toggleActive } from '../controllers/usuario.controller';

const router = Router();
router.use(authMiddleware as any, adminOnly as any);
router.get('/', getAll as any);
router.post('/', create as any);
router.patch('/:id/activar', toggleActive as any);
export default router;
