import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeBaseline, zScore } from './baseline.js';
import { clamp, linMap, round } from './helpers.js';
import { computeSleepQuality } from './sleepQuality.js';
import { computeReadiness } from './readiness.js';
import { computeStrain } from './strain.js';
import { computeEnergyLevel } from './energyLevel.js';
import { computeStress } from './stress.js';
import { computeDailyScores } from './index.js';
import type { Baselines, DayInput, UserInput } from './types.js';

// Suite del motor de scores. Lógica PURA: sin BD, sin mongodb-memory-server.

// --- Helpers de fixtures --------------------------------------------------

/** Baselines neutras: sin histórico (cold-start). */
function emptyBaselines(): Baselines {
  return {
    rhr: { mean: 0, sd: 0, n: 0 },
    hrv: { mean: 0, sd: 0, n: 0 },
    energyMean: undefined,
    energyAcute: undefined,
    energyChronic: undefined,
  };
}

/** Serie horaria de FC sintética: `n` muestras con `avg` constante. */
function hrSamples(n: number, avg: number) {
  return Array.from({ length: n }, (_, i) => ({
    t: `${String(i).padStart(2, '0')}:00`,
    avg,
  }));
}

// ===========================================================================
// helpers
// ===========================================================================

test('clamp / linMap / round', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);

  // Punto medio del dominio → punto medio del rango.
  assert.equal(linMap(5, 0, 10, 0, 100), 50);
  // Fuera del dominio → clamp al borde del rango.
  assert.equal(linMap(-5, 0, 10, 0, 100), 0);
  assert.equal(linMap(15, 0, 10, 0, 100), 100);
  // Dominio degenerado → y0.
  assert.equal(linMap(5, 3, 3, 42, 99), 42);

  assert.equal(round(2.5), 3); // round half-up de Math.round
  assert.equal(round(2.46, 1), 2.5);
});

// ===========================================================================
// baseline
// ===========================================================================

test('computeBaseline: media / sd muestral / n, filtra undefined', () => {
  const history: DayInput[] = [
    { date: '2026-06-01', metrics: { heartRate: { min: 50 } } },
    { date: '2026-06-02', metrics: { heartRate: { min: 52 } } },
    { date: '2026-06-03', metrics: { heartRate: { min: 54 } } },
    { date: '2026-06-04', metrics: { heartRate: {} } }, // sin min -> descartado
    { date: '2026-06-05', metrics: {} }, // sin heartRate -> descartado
  ];
  const b = computeBaseline(history, (d) => d.metrics?.heartRate?.min);
  assert.equal(b.n, 3, 'solo 3 valores válidos');
  assert.equal(b.mean, 52, 'media de 50,52,54');
  // sd muestral de [50,52,54] = sqrt(((-2)^2+0+2^2)/(3-1)) = sqrt(4) = 2
  assert.equal(round(b.sd, 1), 2);
});

test('computeBaseline: n<2 -> sd=0; lista vacía -> n=0', () => {
  const one: DayInput[] = [{ date: '2026-06-01', metrics: { heartRate: { min: 50 } } }];
  const b1 = computeBaseline(one, (d) => d.metrics?.heartRate?.min);
  assert.equal(b1.n, 1);
  assert.equal(b1.sd, 0, 'sin dispersión estimable con n=1');

  const b0 = computeBaseline([], (d) => d.metrics?.heartRate?.min);
  assert.deepEqual(b0, { mean: 0, sd: 0, n: 0 });
});

test('zScore: sd=0 -> 0 (guarda dura)', () => {
  assert.equal(zScore(60, { mean: 50, sd: 0 }), 0);
  assert.equal(zScore(60, { mean: 50, sd: 5 }), 2);
  assert.equal(zScore(40, { mean: 50, sd: 5 }), -2);
});

// ===========================================================================
// sleepQuality
// ===========================================================================

test('sleepQuality: noche ideal (~8h, buenas fases) -> excellent', () => {
  const res = computeSleepQuality({
    total: 8,
    deep: 8 * 0.18, // 18% en [13,23]
    rem: 8 * 0.22, // 22% en [20,25]
    awake: 0.2, // continuidad perfecta
  });
  assert.ok(res);
  assert.equal(res!.state, 'excellent');
  assert.ok(res!.score >= 85, `score ${res!.score} debe ser >= 85`);
});

test('sleepQuality: sueño corto (4h) penaliza duración', () => {
  const ideal = computeSleepQuality({ total: 8, deep: 1.44, rem: 1.76, awake: 0.2 })!;
  const corto = computeSleepQuality({ total: 4, deep: 0.72, rem: 0.88, awake: 0.2 })!;
  assert.ok(corto.score < ideal.score, 'dormir 4h puntúa menos que 8h');
  // duración a 4h cae al borde inferior del tramo [4,7.5] -> 30.
  assert.equal(corto.components.durationScore, 30);
});

test('sleepQuality: mucho tiempo despierto baja eficiencia y continuidad', () => {
  const base = computeSleepQuality({ total: 7.5, deep: 1.35, rem: 1.65, awake: 0.2 })!;
  const fragmentado = computeSleepQuality({ total: 7.5, deep: 1.35, rem: 1.65, awake: 1.5 })!;
  assert.ok(fragmentado.score < base.score, 'awake alto baja el score');
  assert.ok(
    fragmentado.components.efficiencyScore < base.components.efficiencyScore,
    'eficiencia cae',
  );
  assert.ok(
    fragmentado.components.continuityScore < base.components.continuityScore,
    'continuidad cae',
  );
});

test('sleepQuality: sin total -> null; sin fases -> reparador neutral 60', () => {
  assert.equal(computeSleepQuality(undefined), null);
  assert.equal(computeSleepQuality({ awake: 0.2 }), null);

  const res = computeSleepQuality({ total: 8, awake: 0.2 })!;
  assert.equal(res.components.restorativeScore, 60, 'sin deep/rem -> 60');
});

test('sleepQuality: total 0 o negativo -> null (ausencia de sueño, no "poor")', () => {
  assert.equal(computeSleepQuality({ total: 0, awake: 0.2 }), null, 'total=0 -> null');
  assert.equal(computeSleepQuality({ total: -5, awake: 0.2 }), null, 'total negativo -> null');
});

// ===========================================================================
// readiness
// ===========================================================================

test('readiness: cold-start (history vacío) -> confidence low, se apoya en sueño', () => {
  const today: DayInput = {
    date: '2026-06-30',
    metrics: { sleep: { total: 8 }, heartRate: { min: 50, avg: 65 } },
  };
  const sleep = computeSleepQuality(today.metrics!.sleep)!;
  const res = computeReadiness(today, emptyBaselines(), sleep.score);
  assert.ok(res, 'con sueño hay readiness aunque no haya baseline');
  assert.equal(res!.confidence, 'low', 'sin histórico -> low');
  // Único componente disponible: el sueño (rhr.n=0, sin hrv, sin carga).
  assert.deepEqual(Object.keys(res!.components), ['sleep']);
  assert.equal(res!.score, sleep.score, 'readiness == score de sueño al renormalizar a 1');
});

test('readiness: RHR elevado vs baseline baja el score', () => {
  const baseBaselines: Baselines = {
    ...emptyBaselines(),
    rhr: { mean: 50, sd: 4, n: 20 },
  };
  const sleepScore = 80;

  const normal: DayInput = { date: '2026-06-30', metrics: { heartRate: { min: 50 } } };
  const elevado: DayInput = { date: '2026-06-30', metrics: { heartRate: { min: 62 } } };

  const rNormal = computeReadiness(normal, baseBaselines, sleepScore)!;
  const rElevado = computeReadiness(elevado, baseBaselines, sleepScore)!;
  assert.ok(rElevado.score < rNormal.score, 'RHR alta vs tu media reduce readiness');
  assert.equal(rNormal.confidence, 'high', 'n=20 -> high');
});

test('readiness: sin HRV redistribuye pesos (no rompe)', () => {
  const baselines: Baselines = {
    ...emptyBaselines(),
    rhr: { mean: 50, sd: 4, n: 10 },
    hrv: { mean: 60, sd: 8, n: 10 },
  };
  // today sin hrv -> el componente hrv no entra.
  const today: DayInput = { date: '2026-06-30', metrics: { heartRate: { min: 50 } } };
  const res = computeReadiness(today, baselines, 80)!;
  assert.ok(!('hrv' in res.components), 'sin dato HRV no hay componente hrv');
  assert.equal(res.confidence, 'medium', 'n=10 -> medium');
  assert.ok(res.score >= 0 && res.score <= 100);
});

test('readiness: HRV presente entra como componente y mueve el score', () => {
  const baselines: Baselines = {
    ...emptyBaselines(),
    rhr: { mean: 50, sd: 4, n: 10 },
    hrv: { mean: 60, sd: 8, n: 10 },
  };
  const baseHr = { min: 50 }; // rhr en la media -> rhrComp neutral (75)

  // Sin HRV: solo sueño + rhr.
  const sinHrv: DayInput = { date: '2026-06-30', metrics: { heartRate: baseHr } };
  const rSinHrv = computeReadiness(sinHrv, baselines, 80)!;
  assert.ok(!('hrv' in rSinHrv.components), 'sin dato HRV no hay componente hrv');

  // HRV por encima de la media (z=+2 -> hrvComp = 75 + 50 = 100, clamp 100): mejora.
  const hrvAlta: DayInput = {
    date: '2026-06-30',
    metrics: { heartRate: baseHr, hrv: { value: 76 } },
  };
  const rAlta = computeReadiness(hrvAlta, baselines, 80)!;
  assert.ok('hrv' in rAlta.components, 'HRV alta entra como componente');
  assert.equal(rAlta.components.hrv, 100, 'z=+2 -> hrvComp clamp a 100');
  assert.ok(rAlta.score > rSinHrv.score, 'HRV por encima de la media mejora la readiness');

  // HRV por debajo de la media (z=-2 -> hrvComp = 75 - 50 = 25, clamp 40): empeora.
  const hrvBaja: DayInput = {
    date: '2026-06-30',
    metrics: { heartRate: baseHr, hrv: { value: 44 } },
  };
  const rBaja = computeReadiness(hrvBaja, baselines, 80)!;
  assert.ok('hrv' in rBaja.components, 'HRV baja entra como componente');
  assert.equal(rBaja.components.hrv, 40, 'z=-2 -> hrvComp clamp a 40');
  assert.ok(rBaja.score < rSinHrv.score, 'HRV por debajo de la media empeora la readiness');
});

test('readiness: carga sin crónica entra como neutral 75 a medio peso', () => {
  // energyAcute disponible pero SIN energyChronic (histórico corto): rama fallback.
  const baselines: Baselines = {
    ...emptyBaselines(),
    energyAcute: 500,
    energyChronic: undefined,
  };
  const today: DayInput = { date: '2026-06-30', metrics: {} };
  // Solo sueño (peso 0.35) + carga fallback (75 a peso W.load/2 = 0.075).
  const res = computeReadiness(today, baselines, 80)!;
  assert.ok('load' in res.components, 'la carga entra aunque no haya crónica');
  assert.equal(res.components.load, 75, 'carga fallback = neutral 75');
  // Renormaliza sueño(80 · 0.35) + load(75 · 0.075) sobre totalWeight 0.425:
  // round(80*0.35/0.425 + 75*0.075/0.425) = round(65.882 + 13.235) = 79.
  assert.equal(res.score, 79, 'renormalización con la carga a medio peso');
});

test('readiness: sin ningún componente -> null', () => {
  const today: DayInput = { date: '2026-06-30', metrics: {} };
  assert.equal(computeReadiness(today, emptyBaselines(), null), null);
});

// ===========================================================================
// strain
// ===========================================================================

test('strain: día activo puntúa más que sedentario', () => {
  const baselines: Baselines = { ...emptyBaselines(), energyMean: 400 };
  const activo: DayInput = {
    date: '2026-06-30',
    metrics: {
      activeEnergy: { kcal: 800 }, // doble de la media -> energía ~100
      steps: { qty: 14000 },
      heartRate: { samples: hrSamples(10, 150) }, // zonas altas
    },
  };
  const sedentario: DayInput = {
    date: '2026-06-30',
    metrics: {
      activeEnergy: { kcal: 150 },
      steps: { qty: 2000 },
      heartRate: { samples: hrSamples(10, 70) }, // reposo
    },
  };
  const sActivo = computeStrain(activo, baselines, 30)!;
  const sSed = computeStrain(sedentario, baselines, 30)!;
  assert.ok(sActivo.score > sSed.score, 'día activo > sedentario');
  assert.equal(sActivo.state, 'high');
  assert.equal(sSed.state, 'low');
});

test('strain: sin samples de FC no rompe (renormaliza el resto)', () => {
  const baselines: Baselines = { ...emptyBaselines(), energyMean: 400 };
  const today: DayInput = {
    date: '2026-06-30',
    metrics: { activeEnergy: { kcal: 500 }, steps: { qty: 8000 } },
  };
  const res = computeStrain(today, baselines, 30)!;
  assert.ok(res, 'sin cardio sigue habiendo strain');
  assert.ok(!('cardio' in res.components), 'no hay componente cardio');
  assert.ok(res.score >= 0 && res.score <= 100);
});

test('strain: sin samples reescala energy+steps a peso 1 (valor exacto)', () => {
  const baselines: Baselines = { ...emptyBaselines(), energyMean: 400 };
  const today: DayInput = {
    date: '2026-06-30',
    // kcal 500 -> ratio 1.25 -> linMap(1.25,0,2,0,100)=62.5 (energy)
    // steps 9000 -> linMap(9000,0,15000,0,100)=60 (steps)
    metrics: { activeEnergy: { kcal: 500 }, steps: { qty: 9000 } },
  };
  const res = computeStrain(today, baselines, 30)!;
  assert.ok(!('cardio' in res.components), 'sin samples no hay componente cardio');
  assert.equal(res.components.energy, 62.5, 'energy = 62.5');
  assert.equal(res.components.steps, 60, 'steps = 60');
  // Pesos base energy 0.45 + steps 0.15 -> totalWeight 0.60.
  // Reescalados a 1: energy 0.75, steps 0.25.
  // round(62.5*0.75 + 60*0.25) = round(46.875 + 15) = round(61.875) = 62.
  assert.equal(res.score, 62, 'energy+steps renormalizados a peso 1');
});

test('strain: sin energyMean usa referencia absoluta de kcal', () => {
  const today: DayInput = { date: '2026-06-30', metrics: { activeEnergy: { kcal: 500 } } };
  const res = computeStrain(today, emptyBaselines(), 30)!;
  // 500/1000 -> 50 en la escala absoluta; único componente -> score 50.
  assert.equal(res.components.energy, 50);
  assert.equal(res.score, 50);
});

test('strain: sin ningún componente -> null', () => {
  const today: DayInput = { date: '2026-06-30', metrics: {} };
  assert.equal(computeStrain(today, emptyBaselines(), 30), null);
});

// ===========================================================================
// energyLevel
// ===========================================================================

test('energyLevel: monótono con readiness ↑ y strain ↓', () => {
  // Más readiness -> más energía.
  const a = computeEnergyLevel(60, 50)!;
  const b = computeEnergyLevel(90, 50)!;
  assert.ok(b.score > a.score, 'más readiness sube la energía');

  // Más strain -> menos energía.
  const c = computeEnergyLevel(70, 30)!;
  const d = computeEnergyLevel(70, 80)!;
  assert.ok(c.score > d.score, 'más strain baja la energía');
});

test('energyLevel: falta readiness o strain -> null', () => {
  assert.equal(computeEnergyLevel(null, 50), null);
  assert.equal(computeEnergyLevel(60, null), null);
});

// ===========================================================================
// stress
// ===========================================================================

test('stress: confidence siempre proxy', () => {
  const today: DayInput = {
    date: '2026-06-30',
    metrics: { heartRate: { min: 50, avg: 70 } },
  };
  const res = computeStress(today, emptyBaselines(), 80)!;
  assert.equal(res.confidence, 'proxy');
});

test('stress: peor sueño sube el estrés', () => {
  const today: DayInput = {
    date: '2026-06-30',
    metrics: { heartRate: { min: 50, avg: 70 } },
  };
  const buenSueno = computeStress(today, emptyBaselines(), 90)!;
  const malSueno = computeStress(today, emptyBaselines(), 20)!;
  assert.ok(malSueno.score > buenSueno.score, 'mal sueño -> más estrés');
});

test('stress: sin ningún componente -> null', () => {
  const today: DayInput = { date: '2026-06-30', metrics: {} };
  assert.equal(computeStress(today, emptyBaselines(), null), null);
});

// ===========================================================================
// orquestador
// ===========================================================================

test('computeDailyScores: integra los 5 scores y degrada con grace', () => {
  const today: DayInput = {
    date: '2026-06-30',
    metrics: {
      sleep: { total: 8, deep: 1.44, rem: 1.76, awake: 0.2 },
      heartRate: { min: 50, avg: 65, samples: hrSamples(8, 120) },
      steps: { qty: 12000 },
      activeEnergy: { kcal: 600 },
    },
  };
  // Histórico de 20 días con kcal y rhr -> baselines pobladas.
  const history: DayInput[] = Array.from({ length: 20 }, (_, i) => ({
    date: `2026-06-${String(10 + i).padStart(2, '0')}`,
    metrics: { heartRate: { min: 50 + (i % 3) }, activeEnergy: { kcal: 400 } },
  }));
  const user: UserInput = { birthDate: '1995-01-01' };

  const scores = computeDailyScores(today, history, user);
  assert.ok(scores.sleepQuality, 'hay sleepQuality');
  assert.ok(scores.readiness, 'hay readiness');
  assert.ok(scores.strain, 'hay strain');
  assert.ok(scores.energy, 'hay energy (readiness+strain presentes)');
  assert.ok(scores.stress, 'hay stress');
  assert.equal(scores.readiness!.confidence, 'high', 'n=20 -> high');
  assert.equal(scores.stress!.confidence, 'proxy');
});

test('computeDailyScores: día vacío -> todos los scores null', () => {
  const today: DayInput = { date: '2026-06-30', metrics: {} };
  const scores = computeDailyScores(today, [], { age: 30 });
  assert.deepEqual(scores, {
    sleepQuality: null,
    readiness: null,
    strain: null,
    energy: null,
    stress: null,
  });
});

test('computeDailyScores: age override y fallback a 30', () => {
  // Con samples de FC, la edad afecta la FCmax y por tanto el cardioComp.
  const today: DayInput = {
    date: '2026-06-30',
    metrics: { heartRate: { samples: hrSamples(10, 140) } },
  };
  const joven = computeDailyScores(today, [], { age: 20 });
  const mayor = computeDailyScores(today, [], { age: 70 });
  // Mismo avg pero FCmax menor en el mayor -> %FCmax mayor -> más strain cardio.
  assert.ok(
    mayor.strain!.score >= joven.strain!.score,
    'a igual FC, mayor edad implica más carga relativa',
  );

  // Sin age ni birthDate usable -> fallback 30 (no lanza).
  const fb = computeDailyScores(today, [], {});
  assert.ok(fb.strain, 'fallback de edad no rompe');
});
