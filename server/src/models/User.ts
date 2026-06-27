import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';

// Valores permitidos centralizados (reusados por la validación zod)
export const SEX_VALUES = ['male', 'female', 'other'] as const;
export const ROLE_VALUES = ['powerlifting', 'hypertrophy', 'general_health'] as const;
export const THEME_VALUES = ['dark', 'paper'] as const;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Nunca se expone: select:false lo excluye de las consultas por defecto
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    sex: { type: String, enum: SEX_VALUES, required: true },
    birthDate: { type: Date, required: true },
    role: { type: String, enum: ROLE_VALUES, default: 'general_health' },
    // Peso/altura declarados en el registro; la biometría real llegará por sync
    height: { type: Number, required: true }, // cm
    weight: { type: Number, required: true }, // kg
    targetWeight: { type: Number, required: true }, // kg
    preferences: {
      theme: { type: String, enum: THEME_VALUES, default: 'dark' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // Limpia la salida: expone `id`, oculta `_id`, `__v` y el hash de contraseña
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const User = mongoose.model('User', userSchema);
