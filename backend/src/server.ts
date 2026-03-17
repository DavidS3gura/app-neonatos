import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from './config/env';
import authRoutes from './routes/auth.routes';
import neonatoRoutes from './routes/neonato.routes';
import observacionRoutes from './routes/observacion.routes';
import usuarioRoutes from './routes/usuario.routes';
import exportRoutes from './routes/export.routes';

export const prisma = new PrismaClient();
const app = express();

const allowedOrigins = config.corsOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: config.appName,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'APP_Neonatos API running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/neonatos', neonatoRoutes);
app.use('/api/observaciones', observacionRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/export', exportRoutes);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Error:', err.message);

  if (err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${config.port}`);
});