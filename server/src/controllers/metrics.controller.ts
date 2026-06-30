import type { Request, Response } from 'express';
import { DailyMetrics } from '../models/DailyMetrics.js';
import { User } from '../models/User.js';
import { computeDailyScores } from '../services/scores/index.js';
import type { DailyScores, DayInput } from '../services/scores/index.js';

// Cuántos días de histórico cargamos para alimentar baselines/carga del motor.
// La crónica mira hasta 28 días atrás; 60 da margen sin traer toda la colección.
const HISTORY_WINDOW = 60;

// Forma del DTO de un documento diario serializado (toJSON limpia _id/__v).
// No lo tipamos a mano aquí: lo que devuelve `findOne(...).sort()` ya serializa
// con el transform del modelo. El client tiene su propio espejo del shape.
export interface LatestMetricsResponse {
  dailyMetrics: unknown | null;
  scores: DailyScores | null;
}

// GET /api/metrics/latest
// Devuelve el documento de métricas diarias MÁS RECIENTE del usuario (no el de "hoy":
// el usuario exporta el día anterior, así que rara vez existe doc con la fecha actual)
// junto con los scores biométricos calculados AL VUELO sobre ese día + su histórico.
// Si aún no hay datos, responde 200 con dailyMetrics: null (estado vacío, no es un error).
export async function getLatestMetrics(req: Request, res: Response): Promise<void> {
  // Una sola query trae el histórico completo de la ventana.
  // OJO: el `.sort({ date: -1 })` es OBLIGATORIO. El motor asume `history`
  // ordenado de MÁS RECIENTE a MÁS ANTIGUO (history[0] = ayer). Si se invierte,
  // la carga aguda/crónica sale al revés SIN lanzar ningún error.
  const docs = await DailyMetrics.find({ userId: req.userId })
    .sort({ date: -1 })
    .limit(HISTORY_WINDOW);

  if (docs.length === 0) {
    res.status(200).json({ dailyMetrics: null, scores: null });
    return;
  }

  const today = docs[0]!;
  // El histórico NO debe incluir el día de hoy: el motor ya excluye hoy del
  // cálculo agudo, así que arrancamos en el índice 1.
  const history = docs.slice(1);

  // Edad: el motor la deriva de birthDate (campo real del modelo User).
  const user = await User.findById(req.userId);

  // Mapeamos los docs (hidratados) al shape mínimo que consume el motor.
  const toDayInput = (doc: (typeof docs)[number]): DayInput => ({
    date: doc.date,
    metrics: doc.metrics as DayInput['metrics'],
  });

  // Scores calculados AL VUELO, no se persisten en el documento: son baratos y
  // deben reflejar siempre el histórico y los datos manuales más recientes. La
  // caché en Mongo se reserva para el análisis de la IA (CLAUDE.md §4).
  const scores = computeDailyScores(toDayInput(today), history.map(toDayInput), {
    birthDate: user?.birthDate,
  });

  res.status(200).json({ dailyMetrics: today, scores });
}
