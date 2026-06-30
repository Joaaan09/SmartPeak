import type { Request, Response } from 'express';
import { DailyMetrics } from '../models/DailyMetrics.js';

// GET /api/metrics/latest
// Devuelve el documento de métricas diarias MÁS RECIENTE del usuario (no el de "hoy":
// el usuario exporta el día anterior, así que rara vez existe doc con la fecha actual).
// Si aún no hay datos, responde 200 con dailyMetrics: null (estado vacío, no es un error).
export async function getLatestMetrics(req: Request, res: Response): Promise<void> {
  const dailyMetrics = await DailyMetrics.findOne({ userId: req.userId }).sort({ date: -1 });
  res.status(200).json({ dailyMetrics });
}
