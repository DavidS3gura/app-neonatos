import { Response } from 'express';
import * as XLSX from 'xlsx';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';

function sendWorkbook(res: Response, wb: XLSX.WorkBook, filename: string) {
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(buf);
}

function sendCsv(res: Response, rows: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(csv);
}

export async function exportNeonatos(_req: AuthRequest, res: Response) {
  try {
    const data = await prisma.neonato.findMany({ orderBy: { created_at: 'desc' } });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Neonatos');
    sendWorkbook(res, wb, 'neonatos.xlsx');
  } catch {
    res.status(500).json({ error: 'Error al exportar neonatos' });
  }
}

export async function exportObservaciones(_req: AuthRequest, res: Response) {
  try {
    const data = await prisma.observacion.findMany({
      include: { neonato: true },
      orderBy: { created_at: 'desc' },
    });

    const flat = data.map((o) => ({
      id: o.id,
      codigo_rn: o.neonato.codigo_rn,
      neonato_id: o.neonato_id,
      fecha: o.fecha,
      hora: o.hora,
      observador: o.observador,
      posicion_comoda: o.posicion_comoda,
      spo2: o.spo2,
      fr: o.fr,
      fc: o.fc,
      observaciones: o.observaciones,
      created_at: o.created_at,
    }));

    const ws = XLSX.utils.json_to_sheet(flat);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Observaciones');
    sendWorkbook(res, wb, 'observaciones.xlsx');
  } catch {
    res.status(500).json({ error: 'Error al exportar observaciones' });
  }
}

export async function exportNeonatosCSV(_req: AuthRequest, res: Response) {
  try {
    const data = await prisma.neonato.findMany({ orderBy: { created_at: 'desc' } });
    sendCsv(res, data, 'neonatos.csv');
  } catch {
    res.status(500).json({ error: 'Error al exportar neonatos' });
  }
}

export async function exportObservacionesCSV(_req: AuthRequest, res: Response) {
  try {
    const data = await prisma.observacion.findMany({
      include: { neonato: true },
      orderBy: { created_at: 'desc' },
    });

    const flat = data.map((o) => ({
      id: o.id,
      codigo_rn: o.neonato.codigo_rn,
      neonato_id: o.neonato_id,
      fecha: o.fecha,
      hora: o.hora,
      observador: o.observador,
      posicion_comoda: o.posicion_comoda,
      spo2: o.spo2,
      fr: o.fr,
      fc: o.fc,
      observaciones: o.observaciones,
      created_at: o.created_at,
    }));

    sendCsv(res, flat, 'observaciones.csv');
  } catch {
    res.status(500).json({ error: 'Error al exportar observaciones' });
  }
}

export async function exportNeonatoById(req: AuthRequest, res: Response) {
  try {
    const neonato = await prisma.neonato.findUnique({
      where: { id: req.params.id },
    });

    if (!neonato) {
      return res.status(404).json({ error: 'Neonato no encontrado' });
    }

    const ws = XLSX.utils.json_to_sheet([neonato]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Neonato');
    sendWorkbook(res, wb, `neonato_${neonato.codigo_rn}.xlsx`);
  } catch {
    res.status(500).json({ error: 'Error al exportar neonato' });
  }
}

export async function exportNeonatoByIdCSV(req: AuthRequest, res: Response) {
  try {
    const neonato = await prisma.neonato.findUnique({
      where: { id: req.params.id },
    });

    if (!neonato) {
      return res.status(404).json({ error: 'Neonato no encontrado' });
    }

    sendCsv(res, [neonato], `neonato_${neonato.codigo_rn}.csv`);
  } catch {
    res.status(500).json({ error: 'Error al exportar neonato' });
  }
}

export async function exportObservacionesByNeonato(req: AuthRequest, res: Response) {
  try {
    const neonato = await prisma.neonato.findUnique({
      where: { id: req.params.id },
    });

    if (!neonato) {
      return res.status(404).json({ error: 'Neonato no encontrado' });
    }

    const data = await prisma.observacion.findMany({
      where: { neonato_id: req.params.id },
      orderBy: { created_at: 'desc' },
    });

    const flat = data.map((o) => ({
      id: o.id,
      codigo_rn: neonato.codigo_rn,
      neonato_id: o.neonato_id,
      fecha: o.fecha,
      hora: o.hora,
      observador: o.observador,
      posicion_comoda: o.posicion_comoda,
      spo2: o.spo2,
      fr: o.fr,
      fc: o.fc,
      observaciones: o.observaciones,
      created_at: o.created_at,
    }));

    const ws = XLSX.utils.json_to_sheet(flat);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Observaciones');
    sendWorkbook(res, wb, `observaciones_${neonato.codigo_rn}.xlsx`);
  } catch {
    res.status(500).json({ error: 'Error al exportar observaciones del neonato' });
  }
}

export async function exportObservacionesByNeonatoCSV(
  req: AuthRequest,
  res: Response
) {
  try {
    const neonato = await prisma.neonato.findUnique({
      where: { id: req.params.id },
    });

    if (!neonato) {
      return res.status(404).json({ error: 'Neonato no encontrado' });
    }

    const data = await prisma.observacion.findMany({
      where: { neonato_id: req.params.id },
      orderBy: { created_at: 'desc' },
    });

    const flat = data.map((o) => ({
      id: o.id,
      codigo_rn: neonato.codigo_rn,
      neonato_id: o.neonato_id,
      fecha: o.fecha,
      hora: o.hora,
      observador: o.observador,
      posicion_comoda: o.posicion_comoda,
      spo2: o.spo2,
      fr: o.fr,
      fc: o.fc,
      observaciones: o.observaciones,
      created_at: o.created_at,
    }));

    sendCsv(res, flat, `observaciones_${neonato.codigo_rn}.csv`);
  } catch {
    res.status(500).json({ error: 'Error al exportar observaciones del neonato' });
  }
}