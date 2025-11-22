# UI Improvements & Known Issues

This file tracks UI improvements and known issues that need to be addressed in the future.

## Contact Bar (Sticky Action Bar)

### Issue: Element Alignment with 5 Channels

**Status**: Pending
**Priority**: Low
**Reported**: 2025-11-21
**Component**: `components/contact-bar.tsx`

**Description**:
The contact bar elements are slightly misaligned when displaying 5 contact channels (Call, SMS, WhatsApp, Telegram, Email). The original design was created for 3 buttons, but was extended to include WhatsApp and Telegram, causing minor spacing/alignment issues.

**Current State**:

- 5 contact channel buttons + 1 CTA button ("Let's Connect")
- Elements appear slightly shifted on certain screen sizes
- Functionality works correctly, only visual alignment affected

**Proposed Solution**:

- Adjust spacing/padding for 5-button layout
- Possibly reduce button padding or font size on smaller screens
- Ensure consistent alignment across all breakpoints

**Files to Update**:

- `components/contact-bar.tsx` - Main component
- Possibly `tests/a11y/components.test.tsx` - If layout changes affect accessibility

**Visual Reference**:
See `.playwright-mcp/page-2025-11-21T03-21-31-976Z.png` for current state

---

## Footer

No known issues at this time.

---

## Navigation

No known issues at this time.

---

## Policies Page

No known issues at this time.

---

_Last Updated: 2025-11-21_
