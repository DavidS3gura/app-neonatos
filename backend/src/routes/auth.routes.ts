import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.post('/login', login as any);
router.post('/register', register as any);
router.get('/me', authMiddleware as any, me as any);
export default router;
