#!/usr/bin/env node
/**
 * Apply migration to Supabase using SQL query
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function main() {
  console.log('🚀 Applying migrations to Supabase...\n');

  // Read migration files
  const constraintsMigration = readFileSync(
    join(rootDir, 'supabase/migrations/20251010T021104Z_reservation_constraints.sql'),
    'utf-8'
  );

  const functionMigration = readFileSync(
    join(rootDir, 'supabase/migrations/20251015T000000Z_create_reservation_transaction_function.sql'),
    'utf-8'
  );

  console.log('📄 Loaded migration files');
  console.log('  1. reservation_constraints.sql');
  console.log('  2. create_reservation_transaction_function.sql');

  // For Supabase, we'll need to use the SQL editor or psql
  // Let's create a combined file for easy copy-paste
  const combinedSql = `-- Combined Migration Script
-- Execute this in Supabase Dashboard > SQL Editor

${constraintsMigration}

${functionMigration}
`;

  const outputPath = join(rootDir, 'combined_migration.sql');
  writeFileSync(outputPath, combinedSql);

  console.log('\n✅ Created combined migration file: combined_migration.sql');
  console.log('\n📋 Next steps:');
  console.log('  1. Open Supabase Dashboard: https://app.supabase.com');
  console.log('  2. Go to SQL Editor');
  console.log('  3. Copy the contents of combined_migration.sql');
  console.log('  4. Paste and run in SQL Editor');
  console.log('\nOr copy this SQL directly:\n');
  console.log('=' .repeat(80));
  console.log(combinedSql);
  console.log('=' .repeat(80));
}

main().catch(console.error);
