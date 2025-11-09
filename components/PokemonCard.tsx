'use client';

import Link from 'next/link';
import { Pokemon } from '@/lib/types';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const imageUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    '/placeholder-pokemon.png';

  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-300',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-700',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
  };

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-2 border-gray-200 hover:border-blue-400"
    >
      <div className="relative h-48 bg-white flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={pokemon.name}
            className="object-contain p-4 h-full w-full"
          />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold capitalize text-gray-800">
            {pokemon.name}
          </h3>
          <span className="text-sm font-semibold text-gray-500">
            #{String(pokemon.id).padStart(3, '0')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {pokemon.types.map((type) => (
            <span
              key={type.name}
              className={`px-3 py-1 rounded-full text-white text-xs font-semibold capitalize ${
                typeColors[type.name] || 'bg-gray-400'
              }`}
            >
              {type.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

