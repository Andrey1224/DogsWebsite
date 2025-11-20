#!/usr/bin/env node
/**
 * Test Script for sold_at Trigger
 * Tests that sold_at is automatically set when puppy status changes to "sold"
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

dotenv.config({ path: join(projectRoot, '.env.local') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

async function testTrigger() {
  console.log('\n🧪 Testing sold_at Trigger Functionality\n');
  console.log('═══════════════════════════════════════\n');

  // Find an available puppy to use for testing
  const { data: testPuppy, error: findError } = await supabase
    .from('puppies')
    .select('id, name, status, sold_at, is_archived')
    .eq('status', 'available')
    .eq('is_archived', false)
    .limit(1)
    .single();

  if (findError || !testPuppy) {
    console.log('⚠️  No available puppies found for testing');
    console.log('   Creating a test scenario with an already sold puppy...\n');

    // Use a sold puppy instead
    const { data: soldPuppy } = await supabase
      .from('puppies')
      .select('id, name, status, sold_at, is_archived')
      .eq('status', 'sold')
      .limit(1)
      .single();

    if (soldPuppy) {
      console.log(`📌 Using sold puppy: ${soldPuppy.name}`);
      console.log(`   Current status: ${soldPuppy.status}`);
      console.log(`   Current sold_at: ${soldPuppy.sold_at || 'Not set'}`);
      console.log(`   Is archived: ${soldPuppy.is_archived}`);
      console.log();

      // Test 1: Change status to available (should clear sold_at)
      console.log('Test 1: Change status from "sold" to "available" (should clear sold_at)');
      const { data: updated1, error: error1 } = await supabase
        .from('puppies')
        .update({ status: 'available' })
        .eq('id', soldPuppy.id)
        .select('id, name, status, sold_at')
        .single();

      if (error1) {
        console.log('   ❌ Failed:', error1.message);
      } else {
        console.log(`   ✓ Status changed to: ${updated1.status}`);
        console.log(`   ✓ sold_at is now: ${updated1.sold_at || 'NULL (cleared)'}`);
      }
      console.log();

      // Test 2: Change status back to sold (should set sold_at)
      console.log('Test 2: Change status from "available" to "sold" (should set sold_at)');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const { data: updated2, error: error2 } = await supabase
        .from('puppies')
        .update({ status: 'sold' })
        .eq('id', soldPuppy.id)
        .select('id, name, status, sold_at')
        .single();

      if (error2) {
        console.log('   ❌ Failed:', error2.message);
      } else {
        console.log(`   ✓ Status changed to: ${updated2.status}`);
        console.log(`   ✓ sold_at is now: ${updated2.sold_at || 'Not set'}`);
        console.log(`   ✓ sold_at timestamp: ${new Date(updated2.sold_at).toLocaleString()}`);
      }
      console.log();

      // Restore original state
      console.log('Cleanup: Restoring original state...');
      await supabase.from('puppies').update({ status: 'sold' }).eq('id', soldPuppy.id);
      console.log('   ✓ Restored\n');
    }

    console.log('✅ Trigger test complete!\n');
    return;
  }

  // If we have an available puppy, test with it
  console.log(`📌 Testing with puppy: ${testPuppy.name} (${testPuppy.id})`);
  console.log(`   Current status: ${testPuppy.status}`);
  console.log(`   Current sold_at: ${testPuppy.sold_at || 'Not set'}`);
  console.log();

  // Test: Change status to sold
  console.log('Test: Changing status to "sold"...');
  const { data: updatedPuppy, error: updateError } = await supabase
    .from('puppies')
    .update({ status: 'sold' })
    .eq('id', testPuppy.id)
    .select('id, name, status, sold_at, is_archived')
    .single();

  if (updateError) {
    console.log('   ❌ Update failed:', updateError.message);
  } else {
    console.log('   ✓ Status updated successfully!');
    console.log(`   ✓ New status: ${updatedPuppy.status}`);
    console.log(`   ✓ sold_at: ${updatedPuppy.sold_at || 'Not set'}`);
    console.log(`   ✓ is_archived: ${updatedPuppy.is_archived}`);

    if (updatedPuppy.sold_at) {
      console.log(`   ✓ Timestamp: ${new Date(updatedPuppy.sold_at).toLocaleString()}`);
      console.log('\n   🎉 SUCCESS! Trigger automatically set sold_at timestamp!');
    } else {
      console.log('\n   ⚠️  WARNING! sold_at was not set automatically');
    }
  }
  console.log();

  // Restore original status
  console.log('Cleanup: Restoring original status...');
  await supabase
    .from('puppies')
    .update({ status: 'available', sold_at: null })
    .eq('id', testPuppy.id);
  console.log('   ✓ Restored\n');

  console.log('✅ Test complete!\n');
}

testTrigger().catch(console.error);
