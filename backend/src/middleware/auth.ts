import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
  userRol?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; rol: string };
    req.userId = decoded.id;
    req.userRol = decoded.rol;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  next();
}
