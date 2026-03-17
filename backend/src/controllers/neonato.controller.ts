import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';

const neonatoSchema = z.object({
  codigo_rn: z.string().min(1),
  sexo: z.enum(['M', 'F']),
  eg_semanas: z.number().int().min(20).max(45),
  eg_dias: z.number().int().min(0).max(6),
  peso_nacer: z.number().positive(),
  diagnostico_principal: z.string().min(1),
  dias_estancia: z.number().int().min(0),
});

export async function getAll(_req: AuthRequest, res: Response) {
  try {
    const data = await prisma.neonato.findMany({ orderBy: { created_at: 'desc' } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener neonatos' });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const data = await prisma.neonato.findUnique({
      where: { id: req.params.id },
      include: { observaciones: { orderBy: { created_at: 'desc' } } },
    });
    if (!data) return res.status(404).json({ error: 'No encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener neonato' });
  }
}

export async function getByCode(req: AuthRequest, res: Response) {
  try {
    const data = await prisma.neonato.findUnique({
      where: { codigo_rn: req.params.code },
      include: { observaciones: { orderBy: { created_at: 'desc' } } },
    });
    if (!data) return res.status(404).json({ error: 'No encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar neonato' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = neonatoSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

    const exists = await prisma.neonato.findUnique({ where: { codigo_rn: parsed.data.codigo_rn } });
    if (exists) return res.status(409).json({ error: 'El código RN ya existe' });

    const data = await prisma.neonato.create({ data: parsed.data });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear neonato' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = neonatoSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
    const data = await prisma.neonato.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar neonato' });
  }
}
