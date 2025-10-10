#!/usr/bin/env node
/**
 * Script to check and apply pending migrations to Supabase
 * Usage: node scripts/check-and-apply-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(rootDir, '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkConstraints() {
  console.log('📊 Checking current constraints on reservations table...\n');

  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      SELECT
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'reservations'
      ORDER BY constraint_type, constraint_name;
    `
  });

  if (error) {
    // Try direct query if RPC doesn't exist
    const { data: directData, error: directError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'reservations');

    if (directError) {
      console.error('❌ Error checking constraints:', directError);
      return null;
    }
    return directData;
  }

  return data;
}

async function checkFunction() {
  console.log('🔍 Checking if create_reservation_transaction function exists...\n');

  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      SELECT
        proname as function_name,
        pg_get_function_arguments(oid) as arguments
      FROM pg_proc
      WHERE proname = 'create_reservation_transaction';
    `
  });

  if (error) {
    console.error('❌ Error checking function:', error);
    return null;
  }

  return data;
}

async function checkColumns() {
  console.log('📋 Checking columns in reservations table...\n');

  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reservations'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    console.error('❌ Error checking columns:', error);
    return null;
  }

  return data;
}

async function applyMigration(filePath, description) {
  console.log(`\n📝 Applying migration: ${description}...`);

  const sql = readFileSync(filePath, 'utf-8');

  const { data, error } = await supabase.rpc('execute_sql', {
    query: sql
  });

  if (error) {
    console.error(`❌ Error applying migration: ${description}`, error);
    return false;
  }

  console.log(`✅ Successfully applied: ${description}`);
  return true;
}

async function main() {
  console.log('🚀 Starting migration check and apply process...\n');

  // Check current state
  const constraints = await checkConstraints();
  if (constraints) {
    console.log('Current constraints:', constraints);
  }

  const columns = await checkColumns();
  if (columns) {
    console.log('\nCurrent columns:', columns);
  }

  const func = await checkFunction();
  if (func && func.length > 0) {
    console.log('\n✅ create_reservation_transaction function already exists');
  } else {
    console.log('\n⚠️ create_reservation_transaction function NOT found');
  }

  // Check if we need to apply migrations
  const needsConstraints = !constraints ||
    !constraints.some(c => c.constraint_name === 'unique_external_payment_per_provider') ||
    !columns?.some(c => c.column_name === 'payment_provider');

  const needsFunction = !func || func.length === 0;

  console.log('\n📋 Migration Status:');
  console.log(`  - Constraints migration needed: ${needsConstraints ? '✅ YES' : '❌ NO'}`);
  console.log(`  - Function migration needed: ${needsFunction ? '✅ YES' : '❌ NO'}`);

  // Apply migrations if needed
  if (needsConstraints) {
    const success = await applyMigration(
      join(rootDir, 'supabase/migrations/20251010T021104Z_reservation_constraints.sql'),
      'Reservation constraints'
    );
    if (!success) {
      console.error('\n❌ Failed to apply constraints migration');
      process.exit(1);
    }
  }

  if (needsFunction) {
    const success = await applyMigration(
      join(rootDir, 'supabase/migrations/20251015T000000Z_create_reservation_transaction_function.sql'),
      'create_reservation_transaction function'
    );
    if (!success) {
      console.error('\n❌ Failed to apply function migration');
      process.exit(1);
    }
  }

  if (!needsConstraints && !needsFunction) {
    console.log('\n✅ All migrations are already applied!');
  } else {
    console.log('\n✅ All migrations applied successfully!');
  }
}

main().catch(console.error);
