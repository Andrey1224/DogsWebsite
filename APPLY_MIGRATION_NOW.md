# 🚀 Apply Migration Now - Fixed Version

## ⚠️ What Was Fixed

1. **SQL Syntax Error** - Changed `ALTER TABLE ADD CONSTRAINT ... WHERE` to `CREATE UNIQUE INDEX ... WHERE`
2. **NULL Handling** - Added `amount IS NULL OR` to constraint to handle existing data
3. **Data Type** - Fixed `get_reservation_summary` parameter from BIGINT to UUID

## 📋 Choose Your Deployment Method

### Method 1: Complete Migration (Recommended)

Copy and paste the entire [migration_step_by_step.sql](migration_step_by_step.sql) file into Supabase SQL Editor.

**Advantages:**
- ✅ All steps in one file
- ✅ Clear step markers for debugging
- ✅ Comments explain each section

### Method 2: Step-by-Step (If you encounter errors)

Execute each STEP from `migration_step_by_step.sql` separately:

```sql
-- STEP 1: Add columns
-- STEP 2: Add indexes
-- STEP 3: Add unique constraints
-- etc...
```

This helps identify exactly which step fails.

### Method 3: Use Combined File

Use [combined_migration.sql](combined_migration.sql) - same content, fewer comments.

## 🎯 Quick Start

### 1. Open Supabase SQL Editor

Go to: https://app.supabase.com → Your Project → SQL Editor

### 2. Copy Migration SQL

**Option A:** Copy from `migration_step_by_step.sql`
```bash
cat migration_step_by_step.sql | pbcopy  # macOS
cat migration_step_by_step.sql | xclip   # Linux
```

**Option B:** Open file and copy manually

### 3. Paste and Execute

- Paste into SQL Editor
- Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
- Wait for completion (should take 2-5 seconds)

### 4. Verify Success

```bash
node scripts/verify-constraints.mjs
```

Expected output:
```
✅ All required columns exist!
✅ Function exists and validation works
```

## 🔍 What Gets Created

### Columns (6 new)
- ✅ `payment_provider` TEXT
- ✅ `external_payment_id` TEXT
- ✅ `webhook_event_id` BIGINT
- ✅ `expires_at` TIMESTAMPTZ
- ✅ `amount` DECIMAL(10,2)
- ✅ `updated_at` TIMESTAMPTZ

### Indexes (8 total)
- ✅ `idx_reservations_puppy_id`
- ✅ `idx_reservations_status`
- ✅ `idx_reservations_payment_provider`
- ✅ `idx_reservations_external_payment_id`
- ✅ `idx_reservations_webhook_event_id`
- ✅ `idx_reservations_expires_at`
- ✅ `idx_reservations_created_at`
- ✅ `unique_external_payment_per_provider` (partial unique)
- ✅ `idx_one_active_reservation_per_puppy` (partial unique)

### Functions (4 total)
- ✅ `create_reservation_transaction()` - Main atomic function
- ✅ `check_puppy_availability()` - Trigger function
- ✅ `expire_pending_reservations()` - Cleanup utility
- ✅ `get_reservation_summary()` - Analytics

### Triggers (1)
- ✅ `enforce_puppy_availability` - Prevents double-booking

### Constraints (2)
- ✅ `valid_reservation_amount` - Amount >= 0 or NULL
- ✅ `valid_reservation_status` - Status enum validation

## ⚠️ Common Issues & Solutions

### Issue: "syntax error at or near WHERE"
**Solution:** ✅ Fixed! Now using `CREATE UNIQUE INDEX` instead of `ALTER TABLE ADD CONSTRAINT`

### Issue: "constraint violated"
**Solution:** ✅ Fixed! Constraint now allows NULL: `amount IS NULL OR amount >= 0`

### Issue: "function parameter type mismatch"
**Solution:** ✅ Fixed! Changed `puppy_id_param` from BIGINT to UUID

### Issue: "relation webhook_events does not exist"
**Check:** Does the `webhook_events` table exist? If not, apply the webhook migration first:
```bash
# Check if webhook migration exists
ls -la supabase/migrations/*webhook_events*
```

If missing, you need to apply `20251010T021049Z_webhook_events.sql` first.

## 📊 Pre-Flight Checklist

Before applying migration:

- [ ] Backup your database (Supabase auto-backups, but verify)
- [ ] Check you're on the correct project
- [ ] Verify `webhook_events` table exists
- [ ] Ensure no active reservations are being processed
- [ ] Have rollback plan ready (see MIGRATION_GUIDE.md)

## 🧪 Post-Migration Tests

After successful migration:

```bash
# 1. Verify database schema
node scripts/verify-constraints.mjs

# 2. Check function exists
node scripts/check-migrations.mjs

# 3. Run application tests
npm run test

# 4. Build application
npm run build
```

## 🎉 Success Criteria

Migration is successful when:

1. ✅ All 6 columns added
2. ✅ All 8 indexes created
3. ✅ All 4 functions created
4. ✅ Trigger active
5. ✅ Constraints in place
6. ✅ `node scripts/verify-constraints.mjs` shows all green
7. ✅ No errors in Supabase logs

## 📞 Need Help?

If migration fails:

1. **Note the exact error message**
2. **Identify which STEP failed** (if using step-by-step method)
3. **Check Supabase logs** in Dashboard
4. **Run verification:** `node scripts/verify-constraints.mjs`
5. **Review MIGRATION_GUIDE.md** for detailed troubleshooting

## 🔄 After Success

Once migration succeeds:

```bash
# 1. Commit changes
git add .
git commit -m "feat: apply atomic reservation transaction migration"

# 2. Deploy to Vercel
git push origin main

# 3. Monitor deployment
# Check Vercel dashboard for deployment status

# 4. Test live
# Try creating a reservation on production
```

---

**Last Updated:** 2025-10-10 (Fixed version)
**Status:** Ready for deployment ✅
