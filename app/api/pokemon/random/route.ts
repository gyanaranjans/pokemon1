import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { PokemonModel, DailyRandomCacheModel } from '@/models/Pokemon';
import { fetchPokemonFromAPI, getRandomPokemonId } from '@/lib/pokemon';
import { Pokemon } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Get today's date string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Check if we have a cached daily random Pokemon for today
    let dailyCache = await DailyRandomCacheModel.findOne({ date: today });

    if (dailyCache) {
      // Check if the cached Pokemon still exists and is valid
      const cachedPokemon = await PokemonModel.findOne({ id: dailyCache.pokemonId });
      if (cachedPokemon) {
        return NextResponse.json(cachedPokemon.toObject());
      }
    }

    // Generate a new random Pokemon for today
    const randomId = getRandomPokemonId();
    let pokemon: Pokemon;

    // Check if this Pokemon is already in our DB
    let dbPokemon = await PokemonModel.findOne({ id: randomId });
    if (dbPokemon) {
      pokemon = dbPokemon.toObject();
    } else {
      // Fetch from API
      pokemon = await fetchPokemonFromAPI(randomId);

      // Save to DB
      const newPokemon = new PokemonModel(pokemon);
      await newPokemon.save();
      pokemon = newPokemon.toObject();
    }

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update or create daily cache
    const savedPokemon = await PokemonModel.findOne({ id: pokemon.id });
    if (dailyCache) {
      dailyCache.pokemonId = pokemon.id;
      dailyCache.expiresAt = expiresAt;
      if (savedPokemon) {
        dailyCache.pokemon = savedPokemon._id;
      }
      await dailyCache.save();
    } else {
      dailyCache = new DailyRandomCacheModel({
        date: today,
        pokemonId: pokemon.id,
        pokemon: savedPokemon?._id,
        expiresAt,
      });
      await dailyCache.save();
    }

    return NextResponse.json(pokemon);
  } catch (error) {
    console.error('Error fetching daily random Pokemon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily random Pokemon' },
      { status: 500 }
    );
  }
}

