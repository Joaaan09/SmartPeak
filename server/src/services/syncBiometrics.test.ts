import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { ingestHealthPayload } from './syncBiometrics.js';
import { DailyMetrics } from '../models/DailyMetrics.js';
import type { SyncPayload } from '../validation/sync.schema.js';
import {
  hourlyPayloadDay2406,
  hourlyPayloadMultiDay,
  legacyDailyPayload,
} from './__fixtures__/healthPayload.js';

// Suite del normalizador de biometría (ingesta de Health Auto Export).
// Usa mongodb-memory-server: un Mongo efímero en RAM, sin tocar la BD real.

let mongod: MongoMemoryServer;
const userId = new mongoose.Types.ObjectId().toString();

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await DailyMetrics.deleteMany({});
});

// Helper: lee el doc de un día como objeto plano (lean).
async function getDay(date: string): Promise<Record<string, any> | null> {
  return DailyMetrics.findOne({ userId, date }).lean();
}

test('payload horario: puebla y ordena las series intradía', async () => {
  await ingestHealthPayload(userId, hourlyPayloadDay2406());

  const doc = await getDay('2026-06-24');
  assert.ok(doc, 'debe existir el documento del día');
  const m = doc!.metrics;

  // Series presentes.
  assert.ok(Array.isArray(m.steps.hourly), 'steps.hourly es un array');
  assert.ok(Array.isArray(m.activeEnergy.hourly), 'activeEnergy.hourly es un array');
  assert.ok(Array.isArray(m.heartRate.samples), 'heartRate.samples es un array');

  // Ordenadas por `t` ascendente.
  const stepsT = m.steps.hourly.map((h: any) => h.t);
  assert.deepEqual(stepsT, [...stepsT].sort(), 'steps.hourly ordenado por t');
  const hrT = m.heartRate.samples.map((s: any) => s.t);
  assert.deepEqual(hrT, [...hrT].sort(), 'heartRate.samples ordenado por t');
  const aeT = m.activeEnergy.hourly.map((h: any) => h.t);
  assert.deepEqual(aeT, [...aeT].sort(), 'activeEnergy.hourly ordenado por t');

  // Forma de un tramo de pasos.
  assert.equal(m.steps.hourly[0].t, '07:00');
  assert.equal(typeof m.steps.hourly[0].qty, 'number');
});

test('verificacion de suma: total diario de pasos == suma de tramos (18.622)', async () => {
  await ingestHealthPayload(userId, hourlyPayloadDay2406());

  const doc = await getDay('2026-06-24');
  const m = doc!.metrics;

  const sumaTramos = m.steps.hourly.reduce((s: number, h: any) => s + h.qty, 0);
  assert.equal(m.steps.qty, 18622, 'total diario redondeado');
  assert.equal(sumaTramos, m.steps.qty, 'suma de tramos == total diario');
});

test('FC: min = min de Min, max = max de Max, avg = media de Avg', async () => {
  await ingestHealthPayload(userId, hourlyPayloadDay2406());

  const doc = await getDay('2026-06-24');
  const hr = doc!.metrics.heartRate;

  assert.equal(hr.min, 60, 'min = mínimo de los Min horarios');
  assert.equal(hr.max, 150, 'max = máximo de los Max horarios');
  // (94.33 + 88 + 100.67) / 3 = 94.333... -> 94.3
  assert.equal(hr.avg, 94.3, 'avg = media simple de los Avg a 1 decimal');
});

test('energia: total kcal = suma de tramos convertidos de kJ', async () => {
  await ingestHealthPayload(userId, hourlyPayloadDay2406());

  const doc = await getDay('2026-06-24');
  const ae = doc!.metrics.activeEnergy;

  // toKcal redondea cada tramo a 1 decimal; el total redondea la suma.
  const sumaTramos = Math.round(ae.hourly.reduce((s: number, h: any) => s + h.kcal, 0) * 10) / 10;
  assert.equal(ae.kcal, sumaTramos, 'total kcal == suma de tramos (1 decimal)');
  assert.ok(ae.kcal > 0);
});

test('multi-dia: un documento por dia, series separadas', async () => {
  const res = await ingestHealthPayload(userId, hourlyPayloadMultiDay());

  assert.deepEqual(res.days, ['2026-06-24', '2026-06-25']);

  const d25 = await getDay('2026-06-25');
  assert.ok(d25, 'existe el doc del 25');
  const steps25 = d25!.metrics.steps;
  assert.equal(steps25.qty, 1500, 'total del 25 = 500 + 1000');
  // Aunque llegan desordenados (18:00 antes que 06:00), la serie sale ordenada.
  assert.deepEqual(
    steps25.hourly.map((h: any) => h.t),
    ['06:00', '18:00'],
  );
});

test('idempotencia: reenviar el dia con mas horas actualiza, no duplica', async () => {
  // 1er envío: día 24 completo (6 tramos de pasos).
  await ingestHealthPayload(userId, hourlyPayloadDay2406());

  // 2º envío: mismo día con UNA hora extra (22:00). Debe REEMPLAZAR la serie.
  const segundo: SyncPayload = {
    data: {
      metrics: [
        {
          name: 'step_count',
          units: 'count',
          data: [
            { date: '2026-06-24 07:00:00 +0200', qty: 1200.4, source: 'KSIX Ring' },
            { date: '2026-06-24 08:00:00 +0200', qty: 3915.51, source: 'KSIX Ring' },
            { date: '2026-06-24 09:00:00 +0200', qty: 2100.0, source: 'KSIX Ring' },
            { date: '2026-06-24 12:00:00 +0200', qty: 4000.49, source: 'KSIX Ring' },
            { date: '2026-06-24 15:00:00 +0200', qty: 3915.51, source: 'KSIX Ring' },
            { date: '2026-06-24 19:00:00 +0200', qty: 3489.59, source: 'KSIX Ring' },
            { date: '2026-06-24 22:00:00 +0200', qty: 1000, source: 'KSIX Ring' },
          ],
        },
      ],
    },
  };
  await ingestHealthPayload(userId, segundo);

  // Un solo documento para ese día (no se duplica).
  const count = await DailyMetrics.countDocuments({ userId, date: '2026-06-24' });
  assert.equal(count, 1, 'sigue habiendo un único documento del día');

  const doc = await getDay('2026-06-24');
  const steps = doc!.metrics.steps;
  // 7 horas (la serie se reemplazó, no se acumuló sobre las 6 previas).
  assert.equal(steps.hourly.length, 7, 'serie reemplazada con las 7 horas nuevas');
  assert.equal(steps.qty, 18622 + 1000, 'total recalculado con la hora extra');
});

test('sleep: 1 punto por dia con sus fases', async () => {
  await ingestHealthPayload(userId, hourlyPayloadDay2406());

  const doc = await getDay('2026-06-24');
  const sleep = doc!.metrics.sleep;

  assert.equal(sleep.total, 7.5);
  assert.equal(sleep.deep, 1.2);
  assert.equal(sleep.rem, 1.8);
  assert.equal(sleep.core, 4.1);
  assert.equal(sleep.awake, 0.4);
  assert.equal(sleep.sleepStart, '2026-06-23 23:30:00 +0200');
  // El sueño no es horario: no debe tener series.
  assert.equal(sleep.hourly, undefined);
  assert.equal(sleep.samples, undefined);
});

test('retrocompat: payload diario antiguo (sin hora) -> agregado correcto, series ausentes', async () => {
  await ingestHealthPayload(userId, legacyDailyPayload());

  const doc = await getDay('2026-06-20');
  assert.ok(doc, 'existe el doc del día legacy');
  const m = doc!.metrics;

  assert.equal(m.steps.qty, 8500, 'pasos diarios correctos');
  // 2092 kJ / 4.184 = 500.0 kcal
  assert.equal(m.activeEnergy.kcal, 500, 'kcal convertidos desde kJ');
  assert.equal(m.heartRate.min, 50);
  assert.equal(m.heartRate.max, 140);
  assert.equal(m.heartRate.avg, 65);

  // Sin hora extraíble -> series ausentes (no vacías con basura).
  assert.equal(m.steps.hourly, undefined, 'steps.hourly ausente');
  assert.equal(m.activeEnergy.hourly, undefined, 'activeEnergy.hourly ausente');
  assert.equal(m.heartRate.samples, undefined, 'heartRate.samples ausente');
});

test('re-sync: no pisa campos manuales (hrv/spo2/weight) ni readiness', async () => {
  // Sembramos un doc con métricas manuales y readiness ya presentes.
  await DailyMetrics.create({
    userId,
    date: '2026-06-24',
    metrics: {
      hrv: { value: 65, source: 'manual' },
      spo2: { value: 98, source: 'manual' },
      weight: { kg: 82.4, source: 'manual' },
    },
    readiness: { score: 88 },
  });

  // Re-sincronizamos la biometría del Atajo (pasos/FC/energía/sueño).
  await ingestHealthPayload(userId, hourlyPayloadDay2406());

  const doc = await getDay('2026-06-24');
  const m = doc!.metrics;

  // Lo del sync se escribió...
  assert.equal(m.steps.qty, 18622);
  assert.ok(Array.isArray(m.heartRate.samples));
  // ...sin tocar lo manual ni la readiness.
  assert.equal(m.hrv.value, 65, 'hrv intacto');
  assert.equal(m.spo2.value, 98, 'spo2 intacto');
  assert.equal(m.weight.kg, 82.4, 'weight intacto');
  assert.equal(doc!.readiness.score, 88, 'readiness intacta');
});
