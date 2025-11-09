/**
 * Cleanup script to drop problematic indexes from the test collection
 * Run with: npx tsx scripts/cleanup.ts
 */

import 'dotenv/config';
import connectDB from '../lib/mongodb';
import mongoose from 'mongoose';

async function cleanup() {
    try {
        console.log('🧹 Starting cleanup...');
        await connectDB();
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not available');
        }

        const collection = db.collection('test');

        // List all indexes
        const indexes = await collection.indexes();
        console.log('📋 Current indexes:', indexes);

        // Drop the date_1 index if it exists
        try {
            await collection.dropIndex('date_1');
            console.log('✅ Dropped date_1 index');
        } catch (error: any) {
            if (error.code === 27) {
                console.log('ℹ️  date_1 index does not exist');
            } else {
                throw error;
            }
        }

        // Drop any other problematic indexes
        for (const index of indexes) {
            if (index.name === 'date_1') {
                try {
                    await collection.dropIndex(index.name);
                    console.log(`✅ Dropped ${index.name} index`);
                } catch (error: any) {
                    console.log(`⚠️  Could not drop ${index.name}:`, error.message);
                }
            }
        }

        console.log('\n🎉 Cleanup completed!');
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the cleanup
cleanup();

