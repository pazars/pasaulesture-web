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
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Get all migration files sorted by name
    const migrationsDir = join(__dirname, '../app/db/migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files:\n`);
    migrationFiles.forEach(f => console.log(`  - ${f}`));
    console.log('');

    for (const file of migrationFiles) {
      console.log(`\n📄 Running ${file}...`);

      const migrationPath = join(migrationsDir, file);
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
      console.log(`  Found ${statements.length} SQL statements`);

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        const preview = stmt.substring(0, 60).replace(/\s+/g, ' ');
        console.log(`  [${i + 1}/${statements.length}] ${preview}...`);

        // Create template strings array for tagged template syntax
        const templateArray = [stmt];
        templateArray.raw = [stmt];
        await sql(templateArray);
      }

      console.log(`  ✓ ${file} completed`);
    }

    console.log('\n✅ All migrations completed successfully!');

    // Verify table exists and show columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'registrations'
      ORDER BY ordinal_position
    `;

    if (columns.length > 0) {
      console.log('\n📋 registrations table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('\n⚠️  Warning: Could not verify table structure');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
