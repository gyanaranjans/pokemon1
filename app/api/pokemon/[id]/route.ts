import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { PokemonModel } from '@/models/Pokemon';
import { fetchPokemonFromAPI } from '@/lib/pokemon';
import { Pokemon } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const identifier = id.toLowerCase().trim();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Pokemon ID or name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Try to find in MongoDB first
    let pokemon: Pokemon | null = null;

    // Check if identifier is numeric (ID)
    if (!isNaN(Number(identifier))) {
      const dbPokemon = await PokemonModel.findOne({ id: Number(identifier) });
      if (dbPokemon) {
        pokemon = dbPokemon.toObject();
      }
    }

    // If not found by ID, try by name
    if (!pokemon) {
      const dbPokemon = await PokemonModel.findOne({
        name: identifier.toLowerCase(),
      });
      if (dbPokemon) {
        pokemon = dbPokemon.toObject();
      }
    }

    // If found in DB, return it
    if (pokemon) {
      return NextResponse.json(pokemon);
    }

    // If not in DB, fetch from API
    try {
      pokemon = await fetchPokemonFromAPI(identifier);

      // Cache in MongoDB
      try {
        const existing = await PokemonModel.findOne({ id: pokemon.id });
        if (!existing) {
          const newPokemon = new PokemonModel(pokemon);
          await newPokemon.save();
        }
      } catch (error) {
        console.error(`Error caching Pokemon ${pokemon.id}:`, error);
      }

      return NextResponse.json(pokemon);
    } catch (apiError) {
      if (apiError instanceof Error && apiError.message.includes('not found')) {
        return NextResponse.json(
          { error: `Pokemon not found: ${identifier}` },
          { status: 404 }
        );
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Error fetching Pokemon details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon details' },
      { status: 500 }
    );
  }
}

