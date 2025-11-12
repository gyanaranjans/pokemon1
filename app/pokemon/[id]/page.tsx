import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import PokemonDetails from '@/components/PokemonDetails';
import { Pokemon } from '@/lib/types';
import { headers } from 'next/headers';

interface PokemonPageProps {
  params: Promise<{ id: string }>;
}

async function getPokemon(id: string): Promise<Pokemon | null> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const res = await fetch(`${baseUrl}/api/pokemon/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch Pokemon');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    return null;
  }
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
        <div className="h-32 bg-gray-200" />
        <div className="p-8">
          <div className="h-12 bg-gray-200 rounded mb-8 w-1/2 mx-auto" />
          <div className="h-64 bg-gray-200 rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function PokemonContent({ id }: { id: string }) {
  const pokemon = await getPokemon(id);

  if (!pokemon) {
    notFound();
  }

  return <PokemonDetails pokemon={pokemon} />;
}

export default async function PokemonPage({ params }: PokemonPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          ← Back to Home
        </Link>

        {/* Pokemon Details */}
        <Suspense fallback={<LoadingSkeleton />}>
          <PokemonContent id={id} />
        </Suspense>
      </div>
    </main>
  );
}

