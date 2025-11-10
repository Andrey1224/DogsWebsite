# ADR: Parent Metadata Architecture

**Status:** Active
**Date:** 2025-11-08
**Updated:** 2025-11-09

## Context

The admin panel needs a flexible way to associate parent information (sire/dam) with puppies. The client breeds different parents each time, so creating and maintaining parent records for every breeding pair adds unnecessary overhead.

## Decision History

### Phase 1: Via Litter (Original)

```
Puppy → Litter → Parents (Sire/Dam)
```

**Approach:** Puppies linked to litters, litters linked to parent records.

**Limitations:**
- ❌ Required creating a litter record for every breeding
- ❌ Difficult to add puppies without a litter
- ❌ Unclear how to add parent-specific photos per puppy
- ❌ Unnecessary indirection for simple breeding records

**Migration:** Initial schema in `20241007T000000Z_initial_schema.sql`

---

### Phase 2: Direct Parent Selection (2025-11-08)

```
Puppy → Parents (via sire_id, dam_id)
```

**Approach:** Added `sire_id` and `dam_id` foreign keys directly on puppies table.

**Improvements:**
- ✅ Direct dropdown selection of parents
- ✅ No litter record required
- ✅ Gender-filtered dropdowns (sire = male, dam = female)
- ✅ Breed shown in dropdown: "Sir Winston (English Bulldog)"
- ✅ Backward compatible with litter-based puppies

**Migration:** `20250811T120000Z_add_parent_fields_to_puppies.sql`

```sql
ALTER TABLE puppies
  ADD COLUMN sire_id UUID REFERENCES parents(id) ON DELETE SET NULL,
  ADD COLUMN dam_id UUID REFERENCES parents(id) ON DELETE SET NULL;

CREATE INDEX idx_puppies_sire_id ON puppies(sire_id);
CREATE INDEX idx_puppies_dam_id ON puppies(dam_id);
```

**Code Changes:**
- `lib/admin/puppies/queries.ts` - Added parent loading
- `app/admin/puppies/create-puppy-panel.tsx` - Sire/Dam dropdowns
- `lib/supabase/queries.ts` - Priority: `puppy.sire_id` → `litter.sire_id`

---

### Phase 3: Metadata Fields (Current - 2025-11-08)

```
Puppy → Metadata (sire_name, dam_name, photo URLs)
```

**Approach:** Store parent information directly as text fields + photo URLs on puppy record.

**Rationale:**
- Client doesn't need parent record management
- Each puppy can have unique parent photos without creating parent records
- Simpler admin workflow: just type names and upload photos

**Migration:** `20250812T000000Z_add_parent_metadata_to_puppies.sql`

```sql
ALTER TABLE puppies
  ADD COLUMN sire_name TEXT,
  ADD COLUMN dam_name TEXT,
  ADD COLUMN sire_photo_urls TEXT[],
  ADD COLUMN dam_photo_urls TEXT[];

COMMENT ON COLUMN puppies.sire_name IS 'Direct sire (father) name - takes precedence over sire_id';
COMMENT ON COLUMN puppies.dam_name IS 'Direct dam (mother) name - takes precedence over dam_id';
```

**Storage Structure:**
- Bucket: `puppies`
- Path: `{puppyId}/sire/{timestamp}-{index}.{ext}`
- Max 3 photos per parent
- Public read access

**UI Components:**
- Text inputs for `sire_name` and `dam_name`
- File upload fields with preview (up to 3 photos each)
- Client-side direct upload via signed URLs (bypasses 1MB Server Action limit)

**Code Files:**
- `lib/admin/hooks/use-media-upload.ts` - Client-side upload hook
- `app/admin/puppies/upload-actions.ts` - Signed URL generation
- `app/admin/puppies/actions.ts` - Form submission with metadata

---

## Current Priority Pattern

The system uses a **fallback chain** to ensure backward compatibility:

```typescript
// For display (puppy detail page, puppy card):
const sireName = puppy.sire_name ?? puppy.parents?.sire?.name ?? "TBD";
const damName = puppy.dam_name ?? puppy.parents?.dam?.name ?? "TBD";

// For photos:
const sirePhotos = puppy.sire_photo_urls ?? puppy.parents?.sire?.photo_urls ?? [];
const damPhotos = puppy.dam_photo_urls ?? puppy.parents?.dam?.photo_urls ?? [];
```

**Priority Order:**
1. **Metadata fields** (`sire_name`, `dam_name`, `sire_photo_urls`, `dam_photo_urls`) - preferred
2. **Parent records** (`sire_id`, `dam_id` → `parents` table) - fallback
3. **Litter records** (`litter_id` → `litters.sire_id/dam_id`) - legacy

---

## Implementation Files

### Database
- `supabase/migrations/20250811T120000Z_add_parent_fields_to_puppies.sql` - Phase 2
- `supabase/migrations/20250812T000000Z_add_parent_metadata_to_puppies.sql` - Phase 3

### Types
- `lib/supabase/types.ts` - `Puppy` type with metadata fields

### Queries
- `lib/supabase/queries.ts` - `getPuppyBySlug()`, `getPuppiesWithRelations()` with priority pattern
- `lib/admin/puppies/queries.ts` - Admin CRUD operations

### Admin UI
- `app/admin/puppies/create-puppy-panel.tsx` - Form with text inputs + file upload
- `lib/admin/hooks/use-media-upload.ts` - Client-side upload logic
- `app/admin/puppies/upload-actions.ts` - Signed URL generation

### Public UI
- `app/puppies/[slug]/page.tsx` - Priority pattern for display
- `components/puppy-card.tsx` - Priority pattern for cards

---

## Validation

### Schema (Zod)
```typescript
// lib/admin/puppies/schema.ts
sire_name: z.string().trim().max(100).optional(),
dam_name: z.string().trim().max(100).optional(),
```

### Storage
- File types: JPG, PNG, WebP
- Max 3 photos per parent
- Client-side validation before upload

---

## Benefits

**Phase 3 Advantages:**
1. ✅ No need to manage parent records
2. ✅ Each puppy can have unique parent photos
3. ✅ Simple text input workflow
4. ✅ Maintains all historical data (phases 1-2 still work)
5. ✅ Photos stored efficiently in Supabase Storage
6. ✅ Direct uploads bypass Server Action 1MB limit

**Backward Compatibility:**
- Existing puppies with `litter_id` still display correctly
- Existing puppies with `sire_id`/`dam_id` still display correctly
- New puppies can use metadata OR parent records OR both

---

## Future Considerations

### Potential Enhancements
1. Auto-populate metadata from parent records if selected
2. Bulk import parent metadata from CSV
3. Parent photo gallery on puppy detail page
4. Search puppies by parent name

### Migration Path
If client later wants formal parent management:
1. Keep metadata fields for simple cases
2. Use parent records for frequently-bred pairs
3. Priority pattern ensures smooth coexistence

---

## References

**Source Reports:**
- `docs/archive/PARENT_SELECTION_REPORT.md` - Phase 2 implementation (sire_id/dam_id)
- `docs/archive/PARENT_SELECTION_IMPLEMENTATION_REPORT.md` - Phase 3 implementation (metadata)

**Related ADRs:**
- `docs/admin/adr-client-side-uploads.md` - File upload implementation

**Code Reviews:**
- Commit `1787362` - Phase 2 (direct selection)
- Commit `e3bcd1f` - Phase 3 (metadata fields)
