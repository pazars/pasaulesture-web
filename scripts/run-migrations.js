#!/usr/bin/env node

/**
 * Run database migrations
 *
 * Usage:
 *   node scripts/run-migrations.js
 *
 * Requires POSTGRES_URL in .env.local
 */

import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  try {
    // Read migration file
    const migrationPath = join(__dirname, '../app/db/migrations/001_create_registrations.sql');
    const migration = readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await sql.query(migration);

    console.log('✅ Migration completed successfully!');
    console.log('\nTables created:');
    console.log('  - registrations');
    console.log('  - Trigger: update_registrations_updated_at');
    console.log('  - Indexes: event_slug, participant_email, created_at');

    // Verify table exists
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'registrations'
    `;

    if (result.rows.length > 0) {
      console.log('\n✓ Verified: registrations table exists');
    } else {
      console.log('\n⚠️  Warning: Could not verify table creation');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
