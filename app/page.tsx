import SearchBar from '@/components/SearchBar';
import PokemonCard from '@/components/PokemonCard';
import { Pokemon } from '@/lib/types';

async function getDailyRandomPokemon(): Promise<Pokemon | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pokemon/random`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching daily random Pokemon:', error);
    return null;
  }
}

export default async function Home() {
  const dailyPokemon = await getDailyRandomPokemon();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Pokemon Explorer
          </h1>
          <p className="text-xl text-gray-600">
            Discover and explore your favorite Pokemon
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar />
        </div>

        {/* Daily Random Pokemon */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Pokemon of the Day
          </h2>
          {dailyPokemon ? (
            <div className="max-w-sm mx-auto">
              <PokemonCard pokemon={dailyPokemon} />
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <p className="text-gray-500">Unable to load daily Pokemon</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
