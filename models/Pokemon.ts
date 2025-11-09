import mongoose, { Schema, Model } from 'mongoose';
import { Pokemon, DailyRandomCache } from '@/lib/types';

// Pokemon Schema
const PokemonSchema = new Schema<Pokemon>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    types: [
      {
        name: String,
        url: String,
      },
    ],
    stats: [
      {
        base_stat: Number,
        effort: Number,
        stat: {
          name: String,
          url: String,
        },
      },
    ],
    abilities: [
      {
        ability: {
          name: String,
          url: String,
        },
        is_hidden: Boolean,
        slot: Number,
      },
    ],
    sprites: {
      front_default: String,
      front_shiny: String,
      back_default: String,
      back_shiny: String,
      other: {
        type: Schema.Types.Mixed,
        required: false,
      },
    },
    height: Number,
    weight: Number,
    base_experience: Number,
    cachedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
  },
  {
    timestamps: false,
  }
);

// Create indexes for efficient search
PokemonSchema.index({ name: 'text' });
PokemonSchema.index({ 'types.name': 1 });
PokemonSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Daily Random Cache Schema
const DailyRandomCacheSchema = new Schema<DailyRandomCache>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pokemonId: {
      type: Number,
      required: true,
    },
    pokemon: {
      type: Schema.Types.ObjectId,
      ref: 'Pokemon',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: false,
  }
);

// Use 'test' collection for Pokemon as specified
export const PokemonModel: Model<Pokemon> =
  mongoose.models.Pokemon || mongoose.model<Pokemon>('Pokemon', PokemonSchema, 'test');

// Use separate collection for daily cache to avoid schema conflicts
export const DailyRandomCacheModel: Model<DailyRandomCache> =
  mongoose.models.DailyRandomCache ||
  mongoose.model<DailyRandomCache>('DailyRandomCache', DailyRandomCacheSchema, 'daily-random-cache');

