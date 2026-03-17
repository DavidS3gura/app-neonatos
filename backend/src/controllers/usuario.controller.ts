import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';

const createSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['admin', 'investigador']),
});

export async function getAll(_req: AuthRequest, res: Response) {
  try {
    const users = await prisma.usuario.findMany({
      orderBy: { created_at: 'desc' },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, created_at: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

    const exists = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
    if (exists) return res.status(409).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.usuario.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        password_hash: hash,
        rol: parsed.data.rol,
      },
    });
    const { password_hash, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
}

export async function toggleActive(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.usuario.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const updated = await prisma.usuario.update({
      where: { id: req.params.id },
      data: { activo: !user.activo },
    });
    const { password_hash, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}
