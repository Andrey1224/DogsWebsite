# Code Cleanup Report - Dead Code Analysis

**Date:** January 23, 2025
**Analyst:** Claude Code
**Status:** Pending Cleanup

---

## Executive Summary

This report identifies **~49.4MB** of unused code, old design artifacts, and unnecessary dependencies that can be safely removed from the codebase. The analysis is conservative and only flags items that are clearly unused.

**Total Potential Impact:**

- **Files to Remove:** ~100 files
- **Disk Space Savings:** ~49.4MB
- **npm Dependencies:** 3 unused packages (~50 sub-dependencies)
- **Code Quality:** Cleaner, more maintainable codebase

---

## 🔴 HIGH PRIORITY - Safe to Delete (~49.4MB)

### 1. Old Design Prototypes - `/new-ui/` Folder

**Status:** ❌ OBSOLETE - All replaced with TypeScript implementations
**Size:** 192KB
**Files:** 15 JSX prototype files

| File                   | Replaced By                                                 | Status        |
| ---------------------- | ----------------------------------------------------------- | ------------- |
| `AboutPage.jsx`        | `app/about/page.tsx`                                        | ✅ Replaced   |
| `AdminLogin.jsx`       | `app/admin/login/page.tsx`                                  | ✅ Replaced   |
| `AdminPanel.jsx`       | `app/admin/(dashboard)/puppies/page.tsx`                    | ✅ Replaced   |
| `AdminPuppyEdit.jsx`   | `app/admin/(dashboard)/puppies/edit-puppy-panel.tsx`        | ✅ Replaced   |
| `AvailablePuppies.jsx` | `app/puppies/page.tsx`                                      | ✅ Replaced   |
| `Contact.jsx`          | `app/contact/page.tsx`                                      | ✅ Replaced   |
| `FAQ.jsx`              | `app/faq/page.tsx`                                          | ✅ Replaced   |
| `Footer_and_menu.jsx`  | `components/site-footer.tsx` + `components/site-header.tsx` | ✅ Replaced   |
| `IntroScreenV2.jsx`    | `components/intro-screen.tsx`                               | ✅ Replaced   |
| `IntroUI.jsx`          | Prototype only                                              | ❌ Never used |
| `MainPage.jsx`         | `app/page.tsx`                                              | ✅ Replaced   |
| `Navigation.jsx`       | `components/site-header.tsx`                                | ✅ Replaced   |
| `PoliciesPage.jsx`     | `app/policies/page.tsx`                                     | ✅ Replaced   |
| `PuppyCard.jsx`        | `components/puppy-card.tsx`                                 | ✅ Replaced   |
| `ReviewsPage.jsx`      | `app/reviews/page.tsx`                                      | ✅ Replaced   |

**Deletion Command:**

```bash
rm -rf new-ui/
```

---

### 2. Screenshot Archive - `.playwright-mcp/` Folder

**Status:** ⚠️ CRITICAL - Testing artifacts taking up massive space
**Size:** 44.2MB (!)
**Files:** 33 screenshot files from October-November 2024

**Examples:**

- `about-desktop-1920x1080.png` (3.8MB)
- `about-final-desktop-4-3-ratio.png` (816KB)
- `contact-page-desktop-screenshot.png` (2.1MB)
- Multiple other test screenshots

**Recommendation:** Delete and add to `.gitignore`

**Deletion Commands:**

```bash
# Add to gitignore first
echo ".playwright-mcp/" >> .gitignore

# Remove folder
rm -rf .playwright-mcp/

# Commit gitignore change
git add .gitignore
git commit -m "chore: ignore playwright-mcp screenshot artifacts"
```

---

### 3. Unused Next.js Default Assets - `/public/*.svg`

**Status:** ❌ Not referenced anywhere in codebase
**Size:** ~5KB
**Files:**

- `public/file.svg` - Next.js starter template
- `public/vercel.svg` - Vercel logo
- `public/next.svg` - Next.js logo
- `public/globe.svg` - Generic globe icon
- `public/window.svg` - Generic window icon

**Deletion Command:**

```bash
rm public/file.svg public/vercel.svg public/next.svg public/globe.svg public/window.svg
```

---

### 4. Prototype Documentation - `Reviews_Elemenet.md`

**Status:** ❌ Not referenced anywhere (also has typo in filename)
**Size:** 184 lines
**Content:** React JSX prototype code for reviews carousel
**Note:** Actual implementation is in `components/review-carousel.tsx`

**Deletion Command:**

```bash
rm Reviews_Elemenet.md
```

---

### 5. Unused npm Dependencies

**Status:** ❌ Not imported or used anywhere in codebase
**Packages:**

- `@react-email/components`
- `react-email`
- `@react-email/render` (if installed)

**Current Implementation:** Custom HTML email templates in `lib/emails/simple-templates.ts`

**Dependency Tree Impact:** ~50 sub-packages

**Removal Commands:**

```bash
npm uninstall @react-email/components react-email @react-email/render
```

**Verification:**

```bash
# Search for any usage (should return no results)
grep -r "@react-email" --include="*.ts" --include="*.tsx" .
```

---

## 🟡 MEDIUM PRIORITY - Verify Before Deletion

### 6. Unused Homepage Components

#### `/components/home/about-preview.tsx`

- **Status:** ❌ Not imported anywhere
- **Size:** 52 lines
- **Description:** Old homepage about section preview
- **Replaced By:** Current homepage layout in `app/page.tsx`

**Deletion Command:**

```bash
rm components/home/about-preview.tsx
```

---

#### `/components/home/faq-preview.tsx`

- **Status:** ❌ Not imported anywhere
- **Size:** 70 lines
- **Description:** Old homepage FAQ section preview
- **Replaced By:** Current homepage layout in `app/page.tsx`

**Deletion Command:**

```bash
rm components/home/faq-preview.tsx
```

---

#### `/components/home/reviews-preview.tsx`

- **Status:** ⚠️ Potentially redundant
- **Size:** 8 lines (async wrapper)
- **Current Usage:** Homepage uses `FeaturedReviewsCarousel` directly
- **Recommendation:** Review imports to confirm it's truly unused

**Verification:**

```bash
grep -r "reviews-preview" --include="*.ts" --include="*.tsx" .
```

---

## 🟢 LOW PRIORITY - Optional Improvements

### 7. Development-Only Component

#### `/components/parent-photo-carousel.tsx`

- **Status:** ⚠️ Only used in development page
- **Usage:** `app/dev/lineage-preview/page.tsx` (blocked in production)
- **Decision:** Keep (used for dev tooling) OR delete if dev page is removed

---

### 8. Add `.playwright-mcp/` to `.gitignore`

**Current Status:** Screenshots are being committed to Git
**Recommendation:** Prevent future screenshot accumulation

**Already in Cleanup Step #2**

---

## 📊 Cleanup Impact Summary

| Category           | Files    | Size              | Priority        |
| ------------------ | -------- | ----------------- | --------------- |
| `/new-ui/` folder  | 15       | 192KB             | 🔴 High         |
| Screenshot archive | 33       | 44.2MB            | 🔴 **Critical** |
| Unused components  | 2-3      | ~200 lines        | 🟡 Medium       |
| Unused assets      | 5        | 5KB               | 🔴 High         |
| Prototype docs     | 1        | 184 lines         | 🔴 High         |
| npm packages       | ~50 deps | ~5MB node_modules | 🔴 High         |
| **TOTAL**          | **~100** | **~49.4MB**       | **Significant** |

---

## 🚀 Recommended Cleanup Workflow

### Option A: Complete Cleanup (Recommended)

```bash
# 1. Create cleanup branch
git checkout -b cleanup/remove-old-design-artifacts

# 2. Remove old design prototypes
rm -rf new-ui/

# 3. Remove screenshot archive and add to gitignore
echo ".playwright-mcp/" >> .gitignore
rm -rf .playwright-mcp/

# 4. Remove unused Next.js assets
rm public/file.svg public/vercel.svg public/next.svg public/globe.svg public/window.svg

# 5. Remove prototype documentation
rm Reviews_Elemenet.md

# 6. Remove unused components (verify first!)
rm components/home/about-preview.tsx
rm components/home/faq-preview.tsx

# 7. Remove unused npm dependencies
npm uninstall @react-email/components react-email @react-email/render

# 8. Run full test suite
npm run verify

# 9. Commit changes
git add -A
git commit -m "chore: remove old design artifacts and unused dependencies

- Remove /new-ui/ folder (15 obsolete prototype files)
- Remove .playwright-mcp/ screenshot archive (44.2MB)
- Remove unused Next.js default SVG assets
- Remove prototype documentation
- Remove unused homepage preview components
- Remove unused @react-email dependencies
- Add .playwright-mcp/ to .gitignore

Total cleanup: ~49.4MB"

# 10. Push and create PR
git push origin cleanup/remove-old-design-artifacts
```

---

### Option B: Staged Cleanup (Conservative)

**Phase 1: Safe Deletions Only**

```bash
# Only remove items with 100% certainty
rm -rf new-ui/
echo ".playwright-mcp/" >> .gitignore
rm -rf .playwright-mcp/
rm public/file.svg public/vercel.svg public/next.svg public/globe.svg public/window.svg
rm Reviews_Elemenet.md
npm uninstall @react-email/components react-email
npm run verify
```

**Phase 2: Component Cleanup (After Verification)**

```bash
# After confirming Phase 1 works in production
rm components/home/about-preview.tsx
rm components/home/faq-preview.tsx
npm run verify
```

---

## ✅ Verification Checklist

After cleanup, verify:

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run e2e` passes
- [ ] Site builds successfully: `npm run build`
- [ ] Site runs in production mode: `npm run start`
- [ ] All pages load correctly in browser
- [ ] No console errors in browser
- [ ] Git history preserved (no force pushes needed)

---

## 📁 Files to Keep (NOT Dead Code)

These files are **intentionally present** and should NOT be removed:

### Archive & Documentation

- `/docs/archive/` - Historical documentation (valuable reference)
- `/docs/history/` - Sprint retrospectives

### Development & Testing

- `/app/dev/lineage-preview/page.tsx` - Dev preview (production-blocked)
- `/app/mock-checkout/page.tsx` - E2E testing mock (Playwright-gated)
- `/components/parent-photo-carousel.tsx` - Used in dev page

### Deprecated But Preserved

- `/lib/admin/puppies/upload.ts` - Marked deprecated, kept for reference

---

## 📝 Notes

- **Git Branch:** Create `cleanup/remove-old-design-artifacts` branch before starting
- **Backup:** Current codebase is in Git, easy to restore if needed
- **Testing:** Run full `npm run verify` suite after each deletion phase
- **Production:** Test on staging environment before deploying to production
- **Documentation:** Update this file after cleanup is complete

---

## 🔍 Analysis Details

**Analysis Date:** January 23, 2025
**Analysis Method:** Automated code scanning + manual verification
**Codebase State:** `main` branch at commit `5bbd5cb`
**Confidence Level:** High (conservative flagging)

**Search Commands Used:**

```bash
# Find unused imports
grep -r "import.*from.*components/home/about-preview" .

# Find file references
grep -r "about-preview" --include="*.ts" --include="*.tsx" .

# Check npm usage
grep -r "@react-email" --include="*.ts" --include="*.tsx" .

# Find all components
find components -name "*.tsx" -type f

# Find all public assets
find public -type f
```

---

## ⚠️ Important Reminders

1. **Always create a Git branch** before cleanup
2. **Run full test suite** after each deletion
3. **Test in browser** to catch runtime issues
4. **Keep this document updated** with cleanup progress
5. **Don't force push** - preserve Git history

---

## 📅 Cleanup Status Tracker

| Item                  | Status     | Completed Date | Notes |
| --------------------- | ---------- | -------------- | ----- |
| `/new-ui/` folder     | ⏳ Pending | -              | -     |
| `.playwright-mcp/`    | ⏳ Pending | -              | -     |
| Unused SVGs           | ⏳ Pending | -              | -     |
| `Reviews_Elemenet.md` | ⏳ Pending | -              | -     |
| npm dependencies      | ⏳ Pending | -              | -     |
| Unused components     | ⏳ Pending | -              | -     |

**Legend:**

- ⏳ Pending
- 🔄 In Progress
- ✅ Completed
- ❌ Skipped

---

**Last Updated:** January 23, 2025
**Document Version:** 1.0
**Next Review:** After cleanup completion
