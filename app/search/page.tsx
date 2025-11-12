import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import PokemonList from '@/components/PokemonList';
import { Pokemon } from '@/lib/types';
import { headers } from 'next/headers';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchPokemon(query: string): Promise<Pokemon[]> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const res = await fetch(
      `${baseUrl}/api/pokemon/search?q=${encodeURIComponent(query)}`,
      {
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error searching Pokemon:', error);
    return [];
  }
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 animate-pulse"
        >
          <div className="h-48 bg-gray-200" />
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  const results = await searchPokemon(query);

  return (
    <>
      {results.length > 0 ? (
        <PokemonList pokemon={results} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No Pokemon found matching &quot;{query}&quot;
          </p>
        </div>
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Search Pokemon
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Search Results */}
        {query ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Results for &quot;{query}&quot;
            </h2>
            <Suspense fallback={<LoadingSkeleton />}>
              <SearchResults query={query} />
            </Suspense>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Enter a search query to find Pokemon
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

