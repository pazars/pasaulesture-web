#!/usr/bin/env node

/**
 * Run database migrations
 *
 * Usage:
 *   node scripts/run-migrations.js
 *
 * Requires DATABASE_URL in .env.local
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Read migration file
    const migrationPath = join(__dirname, '../app/db/migrations/001_create_registrations.sql');
    const migration = readFileSync(migrationPath, 'utf-8');

    // Split migration into individual statements
    // Handle $$ delimiters for functions properly
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;

    for (const line of migration.split('\n')) {
      const trimmedLine = line.trim();

      // Skip comment-only lines and empty lines
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }

      // Check for $$ delimiters (used in function definitions)
      if (line.includes('$$')) {
        inDollarQuote = !inDollarQuote;
      }

      currentStatement += line + '\n';

      // Split on semicolons, but only if not inside a $$ block
      if (trimmedLine.endsWith(';') && !inDollarQuote) {
        const trimmed = currentStatement.trim();
        if (trimmed) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }

    // Execute each statement separately
    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 50).replace(/\s+/g, ' ');
      console.log(`Executing statement ${i + 1}/${statements.length}: ${preview}...`);

      // Create template strings array for tagged template syntax
      const templateArray = [stmt];
      templateArray.raw = [stmt];
      await sql(templateArray);
    }

    console.log('\n✅ Migration completed successfully!');
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

    if (result.length > 0) {
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
