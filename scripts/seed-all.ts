/**
 * Seed script to populate MongoDB with ALL Pokemon (1-1025)
 * WARNING: This will take a long time and make many API calls
 * Run with: npx tsx scripts/seed-all.ts
 * Or: npm run seed:all
 */

import 'dotenv/config';
import connectDB from '../lib/mongodb';
import { PokemonModel } from '../models/Pokemon';
import { fetchPokemonFromAPI } from '../lib/pokemon';

const TOTAL_POKEMON = 1025; // Current max Pokemon ID
const BATCH_SIZE = 10; // Process in batches to avoid overwhelming the API
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

async function seedAllPokemon() {
    try {
        console.log('🌱 Starting full database seed...');
        console.log(`📦 Will seed Pokemon #1 to #${TOTAL_POKEMON}`);
        console.log('⏳ This will take a while...\n');

        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        let seeded = 0;
        let skipped = 0;
        let errors = 0;

        // Process in batches
        for (let startId = 1; startId <= TOTAL_POKEMON; startId += BATCH_SIZE) {
            const endId = Math.min(startId + BATCH_SIZE - 1, TOTAL_POKEMON);
            console.log(`📥 Processing batch: Pokemon #${startId} to #${endId}...`);

            const batchPromises = [];
            for (let pokemonId = startId; pokemonId <= endId; pokemonId++) {
                batchPromises.push(
                    (async () => {
                        try {
                            // Check if Pokemon already exists
                            const existing = await PokemonModel.findOne({ id: pokemonId });
                            if (existing) {
                                skipped++;
                                return;
                            }

                            // Fetch from PokeAPI
                            const pokemon = await fetchPokemonFromAPI(pokemonId);

                            // Save to MongoDB
                            const newPokemon = new PokemonModel(pokemon);
                            await newPokemon.save();
                            seeded++;
                        } catch (error) {
                            // Some Pokemon IDs might not exist, that's okay
                            if (error instanceof Error && error.message.includes('not found')) {
                                skipped++;
                            } else {
                                console.error(`❌ Error seeding Pokemon #${pokemonId}:`, error);
                                errors++;
                            }
                        }
                    })()
                );
            }

            await Promise.all(batchPromises);
            console.log(`   ✅ Batch complete (Seeded: ${seeded}, Skipped: ${skipped}, Errors: ${errors})`);

            // Delay between batches to avoid rate limiting
            if (endId < TOTAL_POKEMON) {
                await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }

        console.log('\n📊 Seed Summary:');
        console.log(`   ✅ Seeded: ${seeded}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📦 Total processed: ${TOTAL_POKEMON}`);
        console.log('\n🎉 Full seed completed!');
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the seed
seedAllPokemon();

