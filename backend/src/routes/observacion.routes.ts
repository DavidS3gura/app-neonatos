import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import {
  getAll,
  create,
  getByNeonato,
  remove,
  removeByNeonato,
} from '../controllers/observacion.controller';

const router = Router();

router.use(authMiddleware as any);

router.get('/', getAll as any);
router.post('/', create as any);
router.get('/neonato/:id', getByNeonato as any);

router.delete('/:id', adminOnly as any, remove as any);
router.delete('/neonato/:id/todas', adminOnly as any, removeByNeonato as any);

export default router;