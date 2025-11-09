'use client';

import { Pokemon } from '@/lib/types';

interface PokemonDetailsProps {
  pokemon: Pokemon;
}

export default function PokemonDetails({ pokemon }: PokemonDetailsProps) {
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

  const statNames: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold capitalize">{pokemon.name}</h1>
            <span className="text-2xl font-semibold">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {pokemon.types.map((type) => (
              <span
                key={type.name}
                className={`px-4 py-2 rounded-full text-white text-sm font-semibold capitalize ${
                  typeColors[type.name] || 'bg-gray-400'
                }`}
              >
                {type.name}
              </span>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Image Section */}
          <div className="flex justify-center mb-8">
            <div className="w-64 h-64 bg-white rounded-xl p-4 flex items-center justify-center border-2 border-gray-200">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={pokemon.name}
                  className="object-contain h-full w-full"
                />
              ) : (
                <div className="text-gray-400">No image</div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Base Stats */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Base Stats</h2>
              <div className="space-y-3">
                {pokemon.stats.map((stat) => (
                  <div key={stat.stat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-700 capitalize">
                        {statNames[stat.stat.name] || stat.stat.name}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {stat.base_stat}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical Attributes */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Attributes</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold text-gray-600">Height</span>
                  <p className="text-lg font-bold text-gray-800">
                    {(pokemon.height / 10).toFixed(1)} m
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600">Weight</span>
                  <p className="text-lg font-bold text-gray-800">
                    {(pokemon.weight / 10).toFixed(1)} kg
                  </p>
                </div>
                {pokemon.base_experience && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">
                      Base Experience
                    </span>
                    <p className="text-lg font-bold text-gray-800">
                      {pokemon.base_experience} XP
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Abilities */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Abilities</h2>
            <div className="flex flex-wrap gap-3">
              {pokemon.abilities.map((ability, index) => (
                <div
                  key={index}
                  className="bg-white px-4 py-2 rounded-lg border-2 border-gray-200"
                >
                  <span className="text-sm font-semibold text-gray-800 capitalize">
                    {ability.ability.name.replace('-', ' ')}
                  </span>
                  {ability.is_hidden && (
                    <span className="ml-2 text-xs text-gray-500">(Hidden)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

