# Edit Puppy - Save Changes Issue Report

**Date**: 2025-01-16
**Component**: `app/admin/(dashboard)/puppies/edit-puppy-panel.tsx`
**Issue**: Save Changes button doesn't update puppy data in database/UI

---

## Problem Statement

When editing a puppy in the admin panel:
1. ✅ Edit panel opens successfully
2. ✅ All fields pre-populate correctly
3. ✅ User can modify fields (e.g., Description)
4. ✅ Click "Save Changes" shows "Saving..." feedback
5. ✅ POST request sent to `/admin/puppies` (returns 200 OK)
6. ❌ Panel doesn't close
7. ❌ No success toast appears
8. ❌ Puppy card doesn't update with new data
9. ❌ Console shows React errors

---

## Root Cause Analysis

### Initial Investigation

The component uses React 19's Server Actions with `useActionState` hook, but faces integration challenges with:
- Client-side file uploads (sire/dam/puppy photos)
- Async operations before calling server action
- Form state management across transitions

### Key Constraint

**File uploads must happen client-side** before submitting to server action because:
- Server Actions have 1MB payload limit
- Photos can be several MB each
- Solution: Upload to Supabase Storage via signed URLs, then pass URLs (< 1KB) to server action

This requires manual `handleSubmit` logic, which complicates React 19's declarative action pattern.

---

## Timeline of Attempted Solutions

### Attempt 1: Direct Server Action Call (Commit: `35485c7`)

**Approach**: Replace `useActionState` with `useTransition` + manual state

```typescript
// Added
const [isPending, startTransition] = useTransition();
const [formState, setFormState] = useState({ status: 'idle' });

// handleSubmit
startTransition(async () => {
  // ... upload files ...
  const result = await updatePuppyAction(formState, filteredFormData);
  setFormState(result);
});
```

**Result**: ❌ FAILED
- Button showed "Saving..."
- POST request sent successfully
- No state updates occurred
- No console errors initially

**Why it failed**: `setFormState` after `await` was not treated as part of the transition

---

### Attempt 2: Nested startTransition (Commit: `6cbb710`)

**Approach**: Wrap state update in nested `startTransition` per React docs

```typescript
startTransition(async () => {
  const result = await updatePuppyAction({ status: 'idle' }, filteredFormData);
  startTransition(() => {  // Nested
    setFormState(result);
  });
});
```

**React Documentation Reference**:
> "State updates after await are not automatically transitions. Wrap them in startTransition."

**Result**: ❌ FAILED
- Button showed "Saving..."
- POST request sent successfully
- **Console Error**: Warnings about nested transitions
- State updates still didn't occur

**Why it failed**: Nested `startTransition` inside async `startTransition` creates race conditions

---

### Attempt 3: Back to useActionState (Commit: `1bd78e9`)

**Approach**: Return to `useActionState` pattern, remove manual transitions

```typescript
// Removed useTransition, added useActionState
const [formState, formAction, isPending] = useActionState<UpdatePuppyState, FormData>(
  updatePuppyAction,
  initialUpdatePuppyState,
);

// handleSubmit - simplified
try {
  // ... upload files ...
  formAction(filteredFormData);  // Direct call, no await
} catch (error) {
  toast.error(error.message);
}
```

**Result**: ❌ FAILED
- **Console Error**:
  ```
  An async function with useActionState was called outside of a transition.
  Either call the returned function inside startTransition, or pass it to an
  'action' or 'formAction' prop.
  ```

**Why it failed**: Calling `formAction` directly in async `handleSubmit` violates React 19 rules

---

### Attempt 4: useActionState + startTransition Wrapper (Current State)

**Approach**: Combine `useActionState` with `startTransition` wrapper

```typescript
// Both hooks
const [formState, formAction, isPending] = useActionState(...);
const [isTransitioning, startTransition] = useTransition();

// handleSubmit
try {
  // ... upload files ...
  startTransition(() => {
    formAction(filteredFormData);
  });
} catch (error) {
  toast.error(error.message);
}
```

**Result**: ⏳ UNKNOWN - User reports still not working
- Console shows hydration error (unrelated - in contact-bar.tsx)
- Need confirmation if Save Changes works now

---

## Current Code State

### File: `app/admin/(dashboard)/puppies/edit-puppy-panel.tsx`

**Imports**:
```typescript
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
```

**Hooks** (lines 64-68):
```typescript
const [formState, formAction, isPending] = useActionState<UpdatePuppyState, FormData>(
  updatePuppyAction,
  initialUpdatePuppyState,
);
const [isTransitioning, startTransition] = useTransition();
```

**Submit Handler** (lines 133-213):
```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formElement = e.currentTarget;

  try {
    const tempId = puppyId;

    // Upload photos (async operations)
    let newSirePhotoUrls: string[] = [];
    let newDamPhotoUrls: string[] = [];
    let newPuppyPhotoUrls: string[] = [];

    if (sireFiles.length > 0) {
      toast.info('Uploading sire photos...');
      newSirePhotoUrls = await uploadFiles(sireFiles, `${tempId}/sire`);
    }
    // ... dam and puppy uploads ...

    // Combine existing + new photos
    const finalSirePhotos = [...existingSirePhotoUrls.filter(...), ...newSirePhotoUrls];
    // ... dam and puppy ...

    // Build FormData
    const rawFormData = new FormData(formElement);
    const filteredFormData = new FormData();
    filteredFormData.append('id', puppyId);

    rawFormData.forEach((value, key) => {
      if (!(value instanceof File)) {
        filteredFormData.append(key, value);
      }
    });

    // Add photo URLs
    finalSirePhotos.forEach((url) => filteredFormData.append('sirePhotoUrls', url));
    // ... dam and puppy ...

    // Call action wrapped in transition
    startTransition(() => {
      formAction(filteredFormData);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    toast.error(errorMessage);
  }
};
```

**Success Handler** (lines 116-129):
```typescript
useEffect(() => {
  if (formState.status === 'success' && !processedSuccessRef.current) {
    processedSuccessRef.current = true;
    toast.success('Puppy updated successfully');
    router.refresh();
    onClose();
  } else if (formState.status === 'error' && formState.formError) {
    toast.error(formState.formError);
  }

  if (formState.status === 'idle') {
    processedSuccessRef.current = false;
  }
}, [formState, router, onClose]);
```

**Button States** (lines 560-566):
```typescript
<button
  type="submit"
  disabled={isPending || isTransitioning || isUploading}
  className="..."
>
  {isPending || isTransitioning || isUploading ? 'Saving...' : 'Save Changes'}
</button>
```

---

## Working Reference: Create Puppy Panel

**File**: `app/admin/(dashboard)/puppies/create-puppy-panel.tsx`

The create panel uses similar file upload logic but works correctly:

```typescript
// Hooks (line 40-43)
const [state, formAction, pending] = useActionState<CreatePuppyState, FormData>(
  createPuppyAction,
  initialCreatePuppyState,
);

// handleSubmit (line 97-142) - SIMPLIFIED
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formElement = e.currentTarget;

  try {
    const tempId = `temp-${Date.now()}`;

    // Upload files (async)
    let sirePhotoUrls: string[] = [];
    if (sireFiles.length > 0) {
      sirePhotoUrls = await uploadFiles(sireFiles, `${tempId}/sire`);
    }
    // ... dam and puppy ...

    // Build FormData
    const rawFormData = new FormData(formElement);
    const filteredFormData = new FormData();
    // ... copy fields, add URLs ...

    // Call action directly (NO startTransition wrapper)
    formAction(filteredFormData);
  } catch (error) {
    toast.error(error.message);
  }
};
```

**Key Difference**: Create panel calls `formAction` directly **without** wrapping in `startTransition`.

But create panel doesn't show the "called outside of a transition" error. Why?

---

## Server Action Signature

**File**: `app/admin/(dashboard)/puppies/actions.ts`

```typescript
export async function updatePuppyAction(
  _: UpdatePuppyState,          // Previous state (ignored)
  formData: FormData,
): Promise<UpdatePuppyState> {
  try {
    await requireAdminSession();

    const puppyId = formData.get('id');
    // ... extract photo arrays ...

    const submission = {
      id: puppyId,
      name: formData.get('name'),
      // ... all fields ...
    };

    const parsed = updatePuppySchema.safeParse(submission);
    if (!parsed.success) {
      return {
        status: 'error',
        fieldErrors: ...,
      };
    }

    await updateAdminPuppy(parsed.data);
    revalidateCatalog(currentPuppy.slug);

    return {
      status: 'success',
    };
  } catch (error) {
    return {
      status: 'error',
      formError: error.message,
    };
  }
}
```

The action executes successfully (confirmed by 200 OK response in logs).

---

## Database Operation

**File**: `lib/admin/puppies/queries.ts` (lines 484-493)

```typescript
export async function updateAdminPuppy(input: UpdatePuppyPayload): Promise<void> {
  const supabase = getAdminSupabaseClient();
  const payload = mapUpdatePayload(input);  // Converts to snake_case

  const { error } = await supabase
    .from('puppies')
    .update(payload)
    .eq('id', input.id);

  if (error) {
    throw error;
  }
}
```

Database update succeeds (no errors in server logs).

---

## Observed Behavior vs Expected

| Action | Expected | Observed |
|--------|----------|----------|
| Click "Save Changes" | Button shows "Saving..." | ✅ Works |
| File uploads | Photos upload to Supabase | ✅ Works (when files present) |
| POST request | Sent to `/admin/puppies` | ✅ Works (200 OK) |
| Database update | Puppy record updated | ✅ Works (confirmed in DB) |
| Server action returns | `{ status: 'success' }` | ✅ Works |
| `formState` updates | Changes to `{ status: 'success' }` | ❌ FAILS |
| `useEffect` triggers | Toast + close panel + refresh | ❌ FAILS (doesn't trigger) |
| Panel closes | Edit panel dismisses | ❌ FAILS |
| UI updates | Puppy card shows new data | ❌ FAILS |

**Conclusion**: The server-side operation succeeds, but the client-side state update fails.

---

## React 19 Documentation Review

### From `react.dev/reference/react/useTransition`:

#### Example: Server Function with useTransition

```jsx
import { updateName } from './actions';

function UpdateName() {
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();

  const submitAction = async () => {
    startTransition(async () => {
      const { error } = await updateName(name);
      if (error) {
        setError(error);
      }
    });
  };

  return (
    <form action={submitAction}>
      <input type="text" name="name" disabled={isPending}/>
    </form>
  );
}
```

**Pattern**: Pass async function to `action` prop, call server function inside `startTransition`.

### From `react.dev/reference/react/useActionState`:

```jsx
const [state, submitAction, isPending] = useActionState(
  async (previousState, newName) => {
    const error = await updateName(newName);
    if (error) return error;
    return null;
  },
  null,
);
```

**Pattern**: Server function integrated directly into `useActionState`.

### Our Hybrid Pattern

We need BOTH:
1. Async file uploads (before server action)
2. Server action call with state management

**The conflict**:
- File uploads require async/await in handleSubmit
- `useActionState` + `formAction` expects to be called either:
  - As form's `action` prop (declarative), OR
  - Inside `startTransition` (imperative)

We chose option 2, but it still fails.

---

## Possible Root Causes

### Hypothesis 1: Async handleSubmit Breaks Transition Chain

When `handleSubmit` is `async` and contains `await uploadFiles()`:
1. Function becomes async
2. `startTransition(() => formAction(...))` executes
3. But the transition might not "wait" for file uploads
4. State updates get lost

### Hypothesis 2: FormData Not Being Received

Maybe the server action receives the wrong data?

**Counter-evidence**: Server logs show 200 OK, database updates successfully.

### Hypothesis 3: useActionState State Updates Blocked

React 19's `useActionState` might have specific rules about when state can update.

**Need to test**: What if we remove file uploads temporarily and test if basic form submission works?

---

## Debugging Steps Not Yet Tried

1. **Add console.logs to server action**:
   ```typescript
   export async function updatePuppyAction(...) {
     console.log('[SERVER] Received formData:', Object.fromEntries(formData));
     const result = { status: 'success' };
     console.log('[SERVER] Returning:', result);
     return result;
   }
   ```

2. **Add console.logs to client useEffect**:
   ```typescript
   useEffect(() => {
     console.log('[CLIENT] formState changed:', formState);
     if (formState.status === 'success') {
       console.log('[CLIENT] Success detected, should close panel');
     }
   }, [formState]);
   ```

3. **Test without file uploads**:
   - Comment out all file upload logic
   - Test if simple text field update works
   - This isolates whether async operations are the problem

4. **Check React DevTools**:
   - Inspect component state in real-time
   - See if `formState` ever changes from `{ status: 'idle' }`

5. **Compare with create panel**:
   - Create panel works despite similar file upload logic
   - Key difference: create panel uses `createPuppyAction` vs `updatePuppyAction`
   - Are the action signatures different in a meaningful way?

---

## Alternative Approaches to Consider

### Option A: Manual Form Submission (No useActionState)

```typescript
const [isPending, setIsPending] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsPending(true);

  try {
    // Upload files
    const urls = await uploadFiles(...);

    // Build FormData
    const formData = new FormData();
    // ... add fields and URLs ...

    // Call server action directly (not via useActionState)
    const result = await updatePuppyAction({ status: 'idle' }, formData);

    if (result.status === 'success') {
      toast.success('Puppy updated successfully');
      router.refresh();
      onClose();
    } else if (result.formError) {
      toast.error(result.formError);
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    setIsPending(false);
  }
};
```

**Pros**:
- Full control over state flow
- No React 19 transition complexity

**Cons**:
- Loses `useActionState` benefits
- More manual error handling

---

### Option B: Split File Upload into Separate Action

```typescript
// New server action for file uploads
export async function uploadPuppyPhotosAction(files: File[], path: string) {
  const urls = await uploadToSupabaseStorage(files, path);
  return urls;
}

// Use in client
const handleSubmit = async (e) => {
  e.preventDefault();

  // Upload via server action (no client-side upload)
  const sireUrls = await uploadPuppyPhotosAction(sireFiles, `${puppyId}/sire`);

  // Build FormData with URLs
  const formData = new FormData();
  sireUrls.forEach(url => formData.append('sirePhotoUrls', url));

  // Call update action (pure server action flow)
  formAction(formData);
};
```

**Pros**:
- All async operations in server actions
- Clean separation of concerns

**Cons**:
- File uploads still hit 1MB Server Action limit
- Doesn't solve the core constraint

---

### Option C: Use Form Action Directly (Declarative)

```typescript
// Remove handleSubmit entirely
// Use formAction as form's action prop

<form action={formAction}>
  {/* Fields */}
</form>

// Handle file uploads in a separate effect or button
<button type="button" onClick={async () => {
  const urls = await uploadFiles(...);
  // Store URLs in hidden inputs
  setUploadedUrls(urls);
}}>
  Upload Photos First
</button>
```

**Pros**:
- Follows React 19's declarative pattern

**Cons**:
- Poor UX (two-step process)
- Breaks expected form submission flow

---

## Questions for Investigation

1. **Does create panel really avoid the "outside of transition" error?**
   - Test create panel with same DevTools open
   - Check if it shows warnings we're missing

2. **Is the server action being called correctly?**
   - Add server-side logging
   - Verify formData contents

3. **Is formState actually updating?**
   - Add client-side logging in useEffect
   - Use React DevTools to inspect state

4. **Does the pattern work without file uploads?**
   - Remove all upload logic
   - Test simple text field update

5. **Are there Next.js caching issues?**
   - Clear .next cache
   - Test in incognito mode
   - Check if `router.refresh()` is necessary

---

## Recommended Next Steps

### Immediate Testing

1. **Add extensive logging**:
   ```typescript
   // Client
   console.log('[SUBMIT] Starting submission');
   console.log('[UPLOAD] Files:', { sireFiles, damFiles, puppyFiles });
   console.log('[FORMDATA] Built:', Object.fromEntries(filteredFormData));
   console.log('[ACTION] Calling formAction');

   // Server
   console.log('[SERVER] Action called with:', { id, name, ... });
   console.log('[SERVER] Returning:', result);
   ```

2. **Test without file uploads**:
   - Comment out lines 140-172 (file upload logic)
   - Set all photo URLs to empty arrays
   - Test if basic text field update works

3. **Compare behavior with create panel**:
   - Add same logging to create panel
   - Create a new puppy
   - See if any console warnings appear

### Long-term Solution

If testing reveals that async file uploads are incompatible with `useActionState`:

**Recommended**: Option A (Manual Form Submission)
- Remove `useActionState`
- Use manual `isPending` state
- Call server action directly with error handling
- This gives full control and matches create panel's pattern

---

## Summary

**What Works**:
- ✅ Form pre-population
- ✅ File uploads to Supabase
- ✅ POST request to server
- ✅ Database updates
- ✅ Server action execution

**What Doesn't Work**:
- ❌ Client-side state updates after server action returns
- ❌ useEffect not triggering on success
- ❌ Panel not closing
- ❌ Toast not appearing
- ❌ UI not refreshing

**Core Issue**:
React 19's `useActionState` + `useTransition` pattern doesn't integrate cleanly with async file uploads happening before the action call. The state update mechanism breaks somewhere in the chain.

**Attempted Solutions**: 4 different patterns, all failed

**Likely Solution**:
Manual state management (Option A) or extensive debugging to understand why `formState` doesn't update.

---

## Files Modified

- `app/admin/(dashboard)/puppies/edit-puppy-panel.tsx` (main component)
- Commits: `35485c7`, `6cbb710`, `1bd78e9`, and current uncommitted changes

## Related Files

- `app/admin/(dashboard)/puppies/actions.ts` (server actions)
- `app/admin/(dashboard)/puppies/create-puppy-panel.tsx` (working reference)
- `lib/admin/puppies/queries.ts` (database operations)
- `lib/admin/puppies/schema.ts` (validation)

---

**Report Generated**: 2025-01-16
**Status**: Issue Unresolved - Requires Further Investigation
