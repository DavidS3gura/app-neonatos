import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  exportNeonatos,
  exportObservaciones,
  exportNeonatosCSV,
  exportObservacionesCSV,
  exportNeonatoById,
  exportNeonatoByIdCSV,
  exportObservacionesByNeonato,
  exportObservacionesByNeonatoCSV,
} from '../controllers/export.controller';

const router = Router();

router.use(authMiddleware as any);

router.get('/neonatos', exportNeonatos as any);
router.get('/observaciones', exportObservaciones as any);
router.get('/neonatos/csv', exportNeonatosCSV as any);
router.get('/observaciones/csv', exportObservacionesCSV as any);

router.get('/neonatos/:id/xlsx', exportNeonatoById as any);
router.get('/neonatos/:id/csv', exportNeonatoByIdCSV as any);

router.get('/observaciones/neonato/:id/xlsx', exportObservacionesByNeonato as any);
router.get('/observaciones/neonato/:id/csv', exportObservacionesByNeonatoCSV as any);

export default router;