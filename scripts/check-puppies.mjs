#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (key === 'SUPABASE_URL') supabaseUrl = value;
      if (key === 'SUPABASE_SERVICE_ROLE') supabaseKey = value;
    }
  });
} catch (err) {
  // .env.local might not exist, use process.env
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPuppies() {
  console.log('🔍 Checking puppies in database...\n');

  // Check total puppies
  const { data: allPuppies, error: allError } = await supabase
    .from('puppies')
    .select('id, name, slug, status, breed, is_archived, sold_at')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Error fetching puppies:', allError.message);
    process.exit(1);
  }

  console.log(`📊 Total puppies in database: ${allPuppies.length}\n`);

  if (allPuppies.length === 0) {
    console.log('⚠️  No puppies found in database!');
    console.log('\n💡 Run: npm run seed (if seed script exists)');
    return;
  }

  // Group by status
  const byStatus = {};
  const byArchiveStatus = { archived: 0, active: 0 };

  allPuppies.forEach((puppy) => {
    // Count by status
    byStatus[puppy.status] = (byStatus[puppy.status] || 0) + 1;

    // Count by archive status
    if (puppy.is_archived === true) {
      byArchiveStatus.archived++;
    } else {
      byArchiveStatus.active++;
    }
  });

  console.log('📈 Puppies by status:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  - ${status}: ${count}`);
  });

  console.log('\n📦 Archive status:');
  console.log(`  - Active (is_archived = false or null): ${byArchiveStatus.active}`);
  console.log(`  - Archived (is_archived = true): ${byArchiveStatus.archived}`);

  console.log('\n🐶 Sample puppies:');
  allPuppies.slice(0, 5).forEach((puppy) => {
    console.log(`  - ${puppy.name} (${puppy.slug})`);
    console.log(`    Status: ${puppy.status}`);
    console.log(`    Breed: ${puppy.breed || 'not set'}`);
    console.log(`    Archived: ${puppy.is_archived === true ? 'yes' : 'no'}`);
    console.log(`    Sold at: ${puppy.sold_at || 'not set'}`);
    console.log('');
  });

  // Check sold puppies
  const soldPuppies = allPuppies.filter(p => p.status === 'sold');
  if (soldPuppies.length > 0) {
    console.log(`\n💰 Sold puppies (${soldPuppies.length}):`);
    soldPuppies.forEach(puppy => {
      const daysAgo = puppy.sold_at
        ? Math.floor((new Date() - new Date(puppy.sold_at)) / (1000 * 60 * 60 * 24))
        : null;
      console.log(`  - ${puppy.name}: sold ${daysAgo !== null ? `${daysAgo} days ago` : 'date unknown'}`);
    });
  }

  // Check if columns exist
  console.log('\n🔧 Checking database columns...');
  const { data: columnCheck } = await supabase
    .from('puppies')
    .select('is_archived, sold_at')
    .limit(1)
    .maybeSingle();

  if (columnCheck && columnCheck.hasOwnProperty('is_archived')) {
    console.log('✅ is_archived column exists');
  } else {
    console.log('⚠️  is_archived column might not exist');
  }

  if (columnCheck && columnCheck.hasOwnProperty('sold_at')) {
    console.log('✅ sold_at column exists');
  } else {
    console.log('⚠️  sold_at column might not exist');
  }
}

checkPuppies().catch(console.error);
