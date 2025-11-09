#!/usr/bin/env node

/**
 * Script to view puppies from Supabase database
 * Usage: node scripts/view-puppies.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function viewPuppies() {
  console.log('🔍 Fetching puppies from Supabase...\n');

  const { data, error } = await supabase
    .from('puppies')
    .select('id, name, slug, status, price_usd, birth_date, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error fetching puppies:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('📭 No puppies found in database');
    return;
  }

  console.log(`✅ Found ${data.length} puppies:\n`);
  console.log('═'.repeat(120));

  data.forEach((puppy, index) => {
    console.log(`\n${index + 1}. ${puppy.name || '(unnamed)'}`);
    console.log(`   ID:         ${puppy.id}`);
    console.log(`   Slug:       ${puppy.slug || '(none)'}`);
    console.log(`   Status:     ${puppy.status}`);
    console.log(`   Price:      $${puppy.price_usd?.toLocaleString() || 'N/A'}`);
    console.log(`   Birth Date: ${puppy.birth_date || 'N/A'}`);
    console.log(`   Created:    ${new Date(puppy.created_at).toLocaleString()}`);
    console.log(`   Updated:    ${new Date(puppy.updated_at).toLocaleString()}`);
    console.log('   ─'.repeat(60));
  });

  console.log('\n═'.repeat(120));
  console.log(`\n📊 Total: ${data.length} puppies`);
}

viewPuppies().catch(console.error);
