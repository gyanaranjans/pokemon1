import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { PokemonModel } from '@/models/Pokemon';
import { searchPokemonAPI } from '@/lib/pokemon';
import { Pokemon } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedQuery = query.toLowerCase().trim();
    const results: Pokemon[] = [];

    // Search in MongoDB first
    // Search by name (case-insensitive)
    const nameMatches = await PokemonModel.find({
      name: { $regex: normalizedQuery, $options: 'i' },
    }).limit(20);

    // Search by ID if query is numeric
    if (!isNaN(Number(normalizedQuery))) {
      const idMatch = await PokemonModel.findOne({ id: Number(normalizedQuery) });
      if (idMatch && !nameMatches.find((p) => p.id === idMatch.id)) {
        nameMatches.push(idMatch);
      }
    }

    // Search by type
    const typeMatches = await PokemonModel.find({
      'types.name': { $regex: normalizedQuery, $options: 'i' },
    }).limit(20);

    // Combine results and remove duplicates
    const dbResults = [...nameMatches, ...typeMatches];
    const uniqueResults = new Map<number, Pokemon>();

    for (const pokemon of dbResults) {
      if (!uniqueResults.has(pokemon.id)) {
        uniqueResults.set(pokemon.id, pokemon.toObject());
      }
    }

    results.push(...Array.from(uniqueResults.values()));

    // If we found results in DB, return them
    if (results.length > 0) {
      return NextResponse.json(results);
    }

    // If no DB results, search API
    const apiResults = await searchPokemonAPI(normalizedQuery);

    // Cache API results in MongoDB
    for (const pokemon of apiResults) {
      try {
        // Check if already exists
        const existing = await PokemonModel.findOne({ id: pokemon.id });
        if (!existing) {
          const newPokemon = new PokemonModel(pokemon);
          await newPokemon.save();
        }
      } catch (error) {
        console.error(`Error caching Pokemon ${pokemon.id}:`, error);
      }
    }

    return NextResponse.json(apiResults);
  } catch (error) {
    console.error('Error searching Pokemon:', error);
    return NextResponse.json(
      { error: 'Failed to search Pokemon' },
      { status: 500 }
    );
  }
}

