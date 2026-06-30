import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

// Documento diario por usuario: un único registro por (userId, date).
// Las métricas del sync (sleep/heartRate/steps/activeEnergy) llegan del Atajo de iOS;
// las manuales (hrv/spo2/weight) y la readiness se rellenarán en pasos posteriores.
// Cada sub-esquema lleva `{ _id: false }`: son objetos embebidos, no subdocumentos
// con identidad propia.

const sleepSchema = new Schema(
  {
    total: { type: Number }, // horas
    deep: { type: Number },
    rem: { type: Number },
    core: { type: Number },
    awake: { type: Number },
    sleepStart: { type: String }, // marca temporal cruda de HAE (no se reinterpreta)
    sleepEnd: { type: String },
    source: { type: String },
  },
  { _id: false },
);

// Series intradía (una muestra por hora). `t` es la hora local "HH:00".
// `{ _id: false }`: cada hora es un objeto embebido, no un subdocumento con
// identidad propia (evita un ObjectId por cada hora).
const heartRateSampleSchema = new Schema(
  {
    t: { type: String, required: true }, // "HH:00"
    min: { type: Number },
    avg: { type: Number },
    max: { type: Number },
  },
  { _id: false },
);

const stepsHourSchema = new Schema(
  {
    t: { type: String, required: true }, // "HH:00"
    qty: { type: Number, required: true },
  },
  { _id: false },
);

const activeEnergyHourSchema = new Schema(
  {
    t: { type: String, required: true }, // "HH:00"
    kcal: { type: Number, required: true },
  },
  { _id: false },
);

const heartRateSchema = new Schema(
  {
    min: { type: Number },
    max: { type: Number },
    avg: { type: Number },
    source: { type: String },
    // `default: undefined` evita que Mongoose materialice un `[]` cuando no hay
    // serie (formato diario antiguo): la serie queda AUSENTE, no vacía.
    samples: { type: [heartRateSampleSchema], default: undefined },
  },
  { _id: false },
);

const stepsSchema = new Schema(
  {
    qty: { type: Number },
    source: { type: String },
    hourly: { type: [stepsHourSchema], default: undefined }, // serie horaria (opcional)
  },
  { _id: false },
);

const activeEnergySchema = new Schema(
  {
    kcal: { type: Number }, // normalizado a kcal en el servicio
    source: { type: String },
    hourly: { type: [activeEnergyHourSchema], default: undefined }, // serie horaria (opcional)
  },
  { _id: false },
);

// Métricas manuales (se poblarán en otro paso). Se declaran ya para fijar el shape.
const hrvSchema = new Schema(
  {
    value: { type: Number },
    source: { type: String },
  },
  { _id: false },
);

const spo2Schema = new Schema(
  {
    value: { type: Number },
    source: { type: String },
  },
  { _id: false },
);

const weightSchema = new Schema(
  {
    kg: { type: Number },
    source: { type: String },
  },
  { _id: false },
);

const metricsSchema = new Schema(
  {
    sleep: { type: sleepSchema },
    heartRate: { type: heartRateSchema },
    steps: { type: stepsSchema },
    activeEnergy: { type: activeEnergySchema },
    hrv: { type: hrvSchema },
    spo2: { type: spo2Schema },
    weight: { type: weightSchema },
  },
  { _id: false },
);

// Readiness se calcula en un paso futuro: subtipo mínimo, abierto a más campos.
const readinessSchema = new Schema(
  {
    score: { type: Number },
  },
  { _id: false, strict: false },
);

const dailyMetricsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    metrics: { type: metricsSchema, default: {} },
    readiness: { type: readinessSchema },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // Misma limpieza de salida que User: expone `id`, oculta `_id` y `__v`
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Un solo documento por usuario y día.
dailyMetricsSchema.index({ userId: 1, date: 1 }, { unique: true });

export type DailyMetricsDoc = HydratedDocument<InferSchemaType<typeof dailyMetricsSchema>>;

export const DailyMetrics = mongoose.model('DailyMetrics', dailyMetricsSchema);
