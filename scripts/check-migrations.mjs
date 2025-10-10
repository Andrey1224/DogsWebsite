#!/usr/bin/env node
/**
 * Simple script to check database state using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env.local manually
const envContent = readFileSync(join(rootDir, '.env.local'), 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRole = envVars.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function checkDatabase() {
  console.log('🔍 Checking database state...\n');

  // Test 1: Check if we can query reservations table
  console.log('1️⃣ Testing reservations table access...');
  const { data: reservations, error: resError } = await supabase
    .from('reservations')
    .select('*')
    .limit(1);

  if (resError) {
    console.error('❌ Error accessing reservations:', resError.message);
  } else {
    console.log('✅ Can access reservations table');
    if (reservations && reservations.length > 0) {
      console.log('   Sample columns:', Object.keys(reservations[0]));
    }
  }

  // Test 2: Check puppies table
  console.log('\n2️⃣ Testing puppies table access...');
  const { data: puppies, error: puppyError } = await supabase
    .from('puppies')
    .select('id, name, status, price_usd')
    .limit(1);

  if (puppyError) {
    console.error('❌ Error accessing puppies:', puppyError.message);
  } else {
    console.log('✅ Can access puppies table');
    if (puppies && puppies.length > 0) {
      console.log('   Sample:', puppies[0]);
    }
  }

  // Test 3: Try to call the RPC function
  console.log('\n3️⃣ Testing create_reservation_transaction function...');
  try {
    // This should fail with parameter error if function exists
    const { error: rpcError } = await supabase.rpc('create_reservation_transaction', {});

    if (rpcError) {
      if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
        console.log('❌ Function does NOT exist - needs migration');
      } else {
        console.log('✅ Function exists (failed as expected due to missing params)');
        console.log('   Error:', rpcError.message);
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n✅ Database check complete!');
}

checkDatabase().catch(console.error);
