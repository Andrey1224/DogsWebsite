# Sold Puppy Visibility and Manual Archiving

**Updated**: 2026-06-18
**Migration**: `20260618120000_keep_sold_puppies_public.sql`
**Status**: ✅ Deployed

---

## Overview

Sold puppies remain public as historical profiles. Visitors can view their photographs, price,
lineage, and other details, but cannot reserve them.

The database continues to use `status='sold'`. The public UI translates this status to
`Unavailable`, and structured data reports `SoldOut`.

## Archiving Rules

- `sold_at` records when a listing changed to `sold`.
- Sold listings are not archived automatically.
- `is_archived=true` means an administrator intentionally hid the listing.
- Archived listings are excluded from the catalog, direct profile URLs, and sitemap.
- The technical record with slug `test` remains archived.

## Catalog Behavior

- Active statuses are ordered before sold listings: `available`, `reserved`, `upcoming`, `sold`.
- Newer listings appear first within each status.
- Sold listings remain in the main catalog and can be filtered with `status=sold`.
- Historical prices remain visible.
- Reservation actions remain blocked because only `available` listings can be reserved.

## Verification

```sql
SELECT name, slug, status, sold_at, is_archived
FROM public.puppies
ORDER BY is_archived, status, created_at DESC;

SELECT jobname
FROM cron.job
WHERE jobname = 'archive-sold-puppies-after-30-days';
```

Expected:

- Real sold puppies have `is_archived=false`.
- The `test` record has `is_archived=true`.
- The old auto-archive cron query returns no rows.

---

## Related Documentation

- **Soft Delete Feature**: `docs/deployment/soft-delete-feature.md`
- **Database Schema**: `lib/supabase/database.types.ts`
- **Original delayed archive migration**:
  `supabase/migrations/20251119000000_delayed_archiving_30_days.sql`
- **Current public sold profile migration**:
  `supabase/migrations/20260618120000_keep_sold_puppies_public.sql`
  | 2025-11-19 | TypeScript types updated | ✅ Complete |
  | 2025-11-19 | Test data cleaned (kept only CHARLIE) | ✅ Complete |
  | 2025-11-19 | Documentation updated | ✅ Complete |

---

## Production Status

- ✅ Migration deployed
- ✅ pg_cron job active
- ✅ Database: 1 puppy (CHARLIE)
- ✅ CHARLIE: `sold_at` set, `is_archived = false`
- ✅ Days until auto-archive: 30
- ✅ TypeScript types validated

**Next archiving run**: Daily at 2:00 AM UTC

---

## Support

For questions or issues:

- Check pg_cron execution history (SQL above)
- Manually run archiving function to test
- Verify trigger functionality with test queries
- Review `node scripts/check-puppies.mjs` output

**Last Updated**: 2025-11-19
