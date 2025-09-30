#!/usr/bin/env node

import * as Dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables
Dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE;
const COLLECTION_SCANS = process.env.MONGODB_COLLECTION_SCANS;
const COLLECTION_ENTRIES = process.env.MONGODB_COLLECTION_ENTRIES;

async function createScheme() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is required');
    return process.exit(1);
  }

  if (!MONGODB_DATABASE) {
    console.error('❌ MONGODB_DATABASE environment variable is required');
    return process.exit(1);
  }

  console.log('Creating MongoDB scheme...');
  console.log(`- database: ${MONGODB_DATABASE}`);
  console.log(`- collections: ${COLLECTION_SCANS}, ${COLLECTION_ENTRIES}`);

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DATABASE);

    // Create collections if they don't exist
    console.log('Creating collections...');
    const scansCollection = db.collection(COLLECTION_SCANS);
    const entriesCollection = db.collection(COLLECTION_ENTRIES);

    // Create indexes for better performance
    console.log('Creating indexes...');

    // Index for scanned bills
    await scansCollection.createIndexes([
      { key: { id: 1 }, unique: true },
      { key: { share_code: 1 }, unique: true },
      { key: { created_on: -1 } },
      { key: { date: -1 } }
    ]);

    // Index for submitted bills
    await entriesCollection.createIndexes([
      { key: { id: 1 }, unique: true },
      { key: { share_code: 1 }, unique: true },
      { key: { created_on: -1 } },
      { key: { date: -1 } },
      { key: { payment_method: 1 } }
    ]);

    console.log('MongoDB setup completed successfully');
    console.log('Billy Split is ready to use');

  } catch (error) {
    console.error('Error setting up MongoDB:', error.message);
    process.exit(1);
  }
}

// Run the setup
createScheme().catch(console.error);
