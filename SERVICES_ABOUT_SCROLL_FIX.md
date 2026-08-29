# Services & About Page Scroll Bug Fix

## Problem Summary
After switching between Services and About pages, chip navigation broke — chips would no longer scroll to their corresponding sections, or the wrong chip would highlight.

## Root Cause Analysis

### The Issue
Both Services and About pages use nearly identical scroll logic with:
- State variables: `activeServiceSection` / `activeAboutSection`
- Refs: `servicesScrollViewRef` / `aboutScrollViewRef`
- Programmatic scroll flags: `isServicesScrollingProgrammatically` / `isAboutScrollingProgrammatically`
- Section offset tracking: `sectionOffsets` / `aboutSectionOffsets`

**THE PROBLEM:** Both ScrollView components' `onScroll` handlers were **ALWAYS ACTIVE** regardless of which page was currently visible.

When you switched pages:
1. Navigate to Services → Services ScrollView renders and scroll listener attaches
2. Navigate to About → About ScrollView renders and scroll listener attaches
3. **BOTH scroll listeners remain active simultaneously**
4. Scrolling on About page triggers BOTH handlers
5. Services handler updates `activeServiceSection` even though Services page isn't visible
6. Cross-contamination causes incorrect chip highlighting and broken navigation

### Why It Happened
React Native doesn't automatically unmount or detach scroll event listeners when components aren't visible. The Services and About pages were both rendered in the same component tree, so their scroll handlers were both processing events even when only one page was shown at a time.

## The Fix

Added a simple `currentPage` check at the start of each scroll handler:

### Services Page (line ~8900)
```javascript
onScroll={(event) => {
  // ✅ FIX: Only process scroll events when Services page is active
  if (currentPage !== 'services') {
    return;
  }
  if (isServicesScrollingProgrammatically.current) {
    console.log('[SERVICES] onScroll blocked - programmatic scroll in progress');
    return;
  }
  // ... rest of scroll logic
}}
```

### About Page (line ~9305)
```javascript
onScroll={(event) => {
  // ✅ FIX: Only process scroll events when About page is active
  if (currentPage !== 'about') {
    return;
  }
  if (isAboutScrollingProgrammatically.current) {
    console.log('[ABOUT] onScroll blocked - programmatic scroll in progress');
    return;
  }
  // ... rest of scroll logic
}}
```

## Testing Instructions

Test the fix by performing these steps **three times in each direction**:

1. **Services → About:**
   - Navigate to Services page
   - Tap "Metabolic Health" chip → should scroll correctly
   - Navigate to About page
   - Tap "Our Team" chip → should scroll correctly
   - Go back to Services
   - Tap "Diagnostics" chip → should still work correctly

2. **About → Services:**
   - Navigate to About page
   - Tap "Patient Stories" chip → should scroll correctly
   - Navigate to Services page
   - Tap "Chronic Disease" chip → should scroll correctly
   - Go back to About
   - Tap "Vision & Mission" chip → should still work correctly

3. **Rapid switching:**
   - Quickly switch Services → About → Services → About
   - Test chip navigation on each page after switching
   - All chips should respond instantly and correctly

## Expected Behavior After Fix

✅ Each page's scroll handler only processes events when that page is active  
✅ Chip navigation works correctly on first tap  
✅ Correct chip highlights as you scroll  
✅ No cross-page interference when switching between Services and About  
✅ Scroll behavior stable after multiple page switches  

## Files Changed

- `App.js` (lines ~8900 and ~9305)

## Commit

```
Fix: Isolate Services and About page scroll listeners to prevent cross-page interference

- Added currentPage check in both Services and About ScrollView onScroll handlers
- Prevents scroll events from one page affecting the other when switching pages
- Root cause: Both scroll listeners were always active regardless of visible page
- Now each handler only processes events when its page is currently active
```

## Key Takeaway

**When implementing multiple scrollable sections with separate state in a single-page app:**
- Always gate scroll/event handlers with page visibility checks
- Shared refs and state can leak across "pages" if not properly isolated
- React Native keeps event listeners attached even when components aren't visible
- Add explicit `currentPage` or visibility guards to prevent cross-contamination
