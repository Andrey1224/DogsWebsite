#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

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

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function checkWebhookEvents() {
  console.log('🔍 Checking webhook_events table...\n');

  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .limit(1);

  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') {
      console.log('❌ Table webhook_events does NOT exist');
    } else {
      console.log('❌ Error accessing webhook_events:', error.message);
    }
  } else {
    console.log('✅ Table webhook_events EXISTS');
    if (data && data.length > 0) {
      console.log('   Sample columns:', Object.keys(data[0]));
    } else {
      console.log('   Table is empty (no rows yet)');
    }
  }
}

checkWebhookEvents().catch(console.error);
