import { Pokemon, PokemonType, PokemonStat, PokemonAbility, PokemonSprites } from './types';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

interface PokeAPIPokemon {
  id: number;
  name: string;
  types: Array<{
    type: {
      name: string;
      url: string;
    };
    slot: number;
  }>;
  stats: Array<{
    base_stat: number;
  effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    back_default: string | null;
    back_shiny: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
  height: number;
  weight: number;
  base_experience: number | null;
}

interface PokeAPISpecies {
  evolution_chain: {
    url: string;
  };
}

interface PokeAPIListResponse {
  count: number;
  results: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Transform PokeAPI response to our Pokemon schema
 */
function transformPokemonData(apiData: PokeAPIPokemon): Pokemon {
  const types: PokemonType[] = apiData.types.map((t) => ({
    name: t.type.name,
    url: t.type.url,
  }));

  const stats: PokemonStat[] = apiData.stats.map((s) => ({
    base_stat: s.base_stat,
    effort: s.effort,
    stat: {
      name: s.stat.name,
      url: s.stat.url,
    },
  }));

  const abilities: PokemonAbility[] = apiData.abilities.map((a) => ({
    ability: {
      name: a.ability.name,
      url: a.ability.url,
    },
    is_hidden: a.is_hidden,
    slot: a.slot,
  }));

  const sprites: PokemonSprites = {
    front_default: apiData.sprites.front_default,
    front_shiny: apiData.sprites.front_shiny,
    back_default: apiData.sprites.back_default,
    back_shiny: apiData.sprites.back_shiny,
    other: apiData.sprites.other,
  };

  return {
    id: apiData.id,
    name: apiData.name,
    types,
    stats,
    abilities,
    sprites,
    height: apiData.height,
    weight: apiData.weight,
    base_experience: apiData.base_experience,
    cachedAt: new Date(),
  };
}

/**
 * Fetch a single Pokemon from PokeAPI by ID or name
 */
export async function fetchPokemonFromAPI(
  identifier: string | number
): Promise<Pokemon> {
  try {
    const response = await fetch(
      `${POKEAPI_BASE_URL}/pokemon/${identifier}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Pokemon not found: ${identifier}`);
      }
      throw new Error(`Failed to fetch Pokemon: ${response.statusText}`);
    }

    const data: PokeAPIPokemon = await response.json();
    return transformPokemonData(data);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error fetching Pokemon from API');
  }
}

/**
 * Search Pokemon in PokeAPI
 * Note: PokeAPI doesn't have a direct search endpoint, so we'll fetch all Pokemon
 * and filter client-side, or use the list endpoint with pagination
 */
export async function searchPokemonAPI(query: string): Promise<Pokemon[]> {
  try {
    const normalizedQuery = query.toLowerCase().trim();

    // First, try to fetch directly if it's a number or exact name match
    if (!isNaN(Number(normalizedQuery))) {
      try {
        const pokemon = await fetchPokemonFromAPI(Number(normalizedQuery));
        return [pokemon];
      } catch {
        // If not found by ID, continue with name search
      }
    }

    // Fetch list of all Pokemon (PokeAPI has ~1300 Pokemon)
    // We'll fetch in batches to search efficiently
    const results: Pokemon[] = [];
    const limit = 1300; // Approximate total count
    const batchSize = 100;

    for (let offset = 0; offset < limit; offset += batchSize) {
      const response = await fetch(
        `${POKEAPI_BASE_URL}/pokemon?limit=${batchSize}&offset=${offset}`,
        {
          next: { revalidate: 3600 },
        }
      );

      if (!response.ok) {
        break;
      }

      const listData: PokeAPIListResponse = await response.json();

      // Filter Pokemon that match the query
      const matchingPokemon = listData.results.filter(
        (p) =>
          p.name.includes(normalizedQuery) ||
          p.url.includes(`/pokemon/${normalizedQuery}/`)
      );

      // Fetch full details for matching Pokemon
      for (const pokemonRef of matchingPokemon) {
        try {
          const pokemonId = pokemonRef.url
            .split('/')
            .filter(Boolean)
            .pop();
          if (pokemonId) {
            const pokemon = await fetchPokemonFromAPI(pokemonId);
            results.push(pokemon);
          }
        } catch (error) {
          console.error(`Error fetching Pokemon ${pokemonRef.name}:`, error);
        }
      }

      // If we found matches and query is specific, we can break early
      if (results.length > 0 && normalizedQuery.length > 3) {
        break;
      }
    }

    // Also search by type if query matches a type name
    try {
      const typeResponse = await fetch(
        `${POKEAPI_BASE_URL}/type/${normalizedQuery}`,
        {
          next: { revalidate: 3600 },
        }
      );

      if (typeResponse.ok) {
        const typeData = await typeResponse.json();
        const pokemonOfType = typeData.pokemon.slice(0, 20); // Limit to first 20

        for (const pokemonRef of pokemonOfType) {
          try {
            const pokemonId = pokemonRef.pokemon.url
              .split('/')
              .filter(Boolean)
              .pop();
            if (pokemonId) {
              const pokemon = await fetchPokemonFromAPI(pokemonId);
              // Avoid duplicates
              if (!results.find((p) => p.id === pokemon.id)) {
                results.push(pokemon);
              }
            }
          } catch (error) {
            console.error(`Error fetching Pokemon by type:`, error);
          }
        }
      }
    } catch {
      // Type search failed, continue
    }

    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error searching Pokemon in API');
  }
}

/**
 * Get a random Pokemon ID (1-1025 is the current range)
 */
export function getRandomPokemonId(): number {
  return Math.floor(Math.random() * 1025) + 1;
}

