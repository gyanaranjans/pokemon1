/**
 * Seed script to populate MongoDB with Pokemon data
 * Run with: npx tsx scripts/seed.ts
 * Or: npm run seed
 */

import 'dotenv/config';
import connectDB from '../lib/mongodb';
import { PokemonModel } from '../models/Pokemon';
import { fetchPokemonFromAPI } from '../lib/pokemon';

// Popular Pokemon IDs to seed (first 151 are Gen 1, plus some popular ones)
const POKEMON_IDS_TO_SEED = [
    // Gen 1 starters and popular
    1, 4, 7, 25, 39, 52, 54, 56, 58, 60, 63, 66, 72, 74, 77, 79, 81, 84, 86, 88,
    90, 92, 95, 96, 98, 100, 102, 104, 108, 109, 111, 113, 114, 115, 116, 118,
    120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134,
    135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149,
    150, 151,
    // Some popular Gen 2-3
    152, 155, 158, 172, 173, 174, 175, 249, 250, 251,
    // Popular Gen 4-5
    387, 390, 393, 494,
    // Popular Gen 6-9
    650, 656, 722, 725, 810, 813, 816,
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed...');
        await connectDB();
        console.log('✅ Connected to MongoDB');

        let seeded = 0;
        let skipped = 0;
        let errors = 0;

        for (const pokemonId of POKEMON_IDS_TO_SEED) {
            try {
                // Check if Pokemon already exists
                const existing = await PokemonModel.findOne({ id: pokemonId });
                if (existing) {
                    console.log(`⏭️  Pokemon #${pokemonId} already exists, skipping...`);
                    skipped++;
                    continue;
                }

                // Fetch from PokeAPI
                console.log(`📥 Fetching Pokemon #${pokemonId} from PokeAPI...`);
                const pokemon = await fetchPokemonFromAPI(pokemonId);

                // Save to MongoDB
                const newPokemon = new PokemonModel(pokemon);
                await newPokemon.save();
                console.log(`✅ Saved ${pokemon.name} (#${pokemon.id}) to database`);
                seeded++;

                // Small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`❌ Error seeding Pokemon #${pokemonId}:`, error);
                errors++;
            }
        }

        console.log('\n📊 Seed Summary:');
        console.log(`   ✅ Seeded: ${seeded}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📦 Total: ${POKEMON_IDS_TO_SEED.length}`);
        console.log('\n🎉 Seed completed!');
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the seed
seedDatabase();

