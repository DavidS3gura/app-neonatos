import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';

const obsSchema = z.object({
  neonato_id: z.string().uuid(),
  fecha: z.string(),
  hora: z.string(),
  observador: z.string().min(1),
  posicion_comoda: z.number().int().min(1).max(5),
  spo2: z.number().int().min(1).max(5),
  fr: z.number().int().min(1).max(5),
  fc: z.number().int().min(1).max(5),
  observaciones: z.string().optional(),
});

export async function getAll(_req: AuthRequest, res: Response) {
  try {
    const data = await prisma.observacion.findMany({
      orderBy: { created_at: 'desc' },
      include: { neonato: true },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener observaciones' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = obsSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const data = await prisma.observacion.create({ data: parsed.data });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear observación' });
  }
}

export async function getByNeonato(req: AuthRequest, res: Response) {
  try {
    const data = await prisma.observacion.findMany({
      where: { neonato_id: req.params.id },
      orderBy: { created_at: 'desc' },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener observaciones' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const existing = await prisma.observacion.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Observación no encontrada' });
    }

    await prisma.observacion.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Observación eliminada correctamente' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar observación' });
  }
}

export async function removeByNeonato(req: AuthRequest, res: Response) {
  try {
    const neonato = await prisma.neonato.findUnique({
      where: { id: req.params.id },
    });

    if (!neonato) {
      return res.status(404).json({ error: 'Neonato no encontrado' });
    }

    const result = await prisma.observacion.deleteMany({
      where: { neonato_id: req.params.id },
    });

    return res.json({
      message: 'Observaciones eliminadas correctamente',
      count: result.count,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar observaciones' });
  }
}