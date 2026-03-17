import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../server';
import { config } from '../config/env';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['admin', 'investigador']).optional(),
});

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

    const user = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
    if (!user || !user.activo) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(parsed.data.password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, rol: user.rol }, config.jwtSecret, { expiresIn: '24h' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

    const exists = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
    if (exists) return res.status(409).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.usuario.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        password_hash: hash,
        rol: parsed.data.rol || 'investigador',
      },
    });
    const { password_hash, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const authReq = req as any;
    const user = await prisma.usuario.findUnique({ where: { id: authReq.userId } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}
