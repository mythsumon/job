#!/usr/bin/env tsx
import { Pool } from 'pg';
import { execSync } from 'child_process';

const DB_CONFIG = {
  host: '192.168.0.171',
  port: 5432,
  database: 'jobmongolia',
  user: 'jobmongolia_user',
  password: 'JobMongolia2025R5!',
  ssl: false
};

const FALLBACK_DB_CONFIG = {
  host: '203.23.49.100',
  port: 5432,
  database: 'jobmongolia',
  user: 'jobmongolia_user',
  password: 'JobMongolia2025R5!',
  ssl: false
};

async function connectToDatabase() {
  console.log('🔌 Connecting to database...');
  
  // Try primary server first
  try {
    const pool = new Pool(DB_CONFIG);
    await pool.query('SELECT 1');
    console.log(`✅ Connected to primary server: ${DB_CONFIG.host}`);
    return pool;
  } catch (error) {
    console.log(`❌ Primary server (${DB_CONFIG.host}) failed, trying fallback...`);
  }
  
  // Try fallback server
  try {
    const pool = new Pool(FALLBACK_DB_CONFIG);
    await pool.query('SELECT 1');
    console.log(`✅ Connected to fallback server: ${FALLBACK_DB_CONFIG.host}`);
    return pool;
  } catch (error) {
    throw new Error('❌ Could not connect to any database server');
  }
}

async function updateDatabaseSchema() {
  let pool: Pool | null = null;
  
  try {
    pool = await connectToDatabase();
    
    console.log('🚀 Applying schema changes using drizzle-kit push...');
    
    // Use drizzle-kit push to apply schema changes
    execSync('npx drizzle-kit push --force', { stdio: 'inherit' });
    
    console.log('✅ Database schema updated successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- All schema changes have been applied');
    console.log('- Tables and columns are now up to date');
    console.log('- Server can be restarted safely');
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

async function main() {
  console.log('');
  console.log('🔄 JobMongolia Database Schema Updater');
  console.log('=====================================');
  console.log('');
  
  await updateDatabaseSchema();
  
  console.log('');
  console.log('🎉 All done! You can now test the application.');
  console.log('');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { updateDatabaseSchema, connectToDatabase }; 