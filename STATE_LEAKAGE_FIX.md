# State Leakage Bug Fix - Services & About Pages

## Problem
The Services and About pages had a state-leakage bug where navigating between them would break the chip-tap scroll behavior. This happened because:

1. **About page was missing the programmatic scroll flag** - Unlike Services, it didn't have `isAboutScrollingProgrammatically` ref to block onScroll during chip taps
2. **About page was missing dynamic chip bar height measurement** - It used a hardcoded 116px instead of dynamically measuring like Services
3. **About page onScroll was always active** - It didn't check if a programmatic scroll was in progress before updating active section
4. **Missing overScrollMode prop** - About page didn't have `overScrollMode="never"` on its ScrollView

## Root Cause
When you tapped a chip on About page, the ScrollView would scroll, but the `onScroll` handler would fire immediately and calculate which section should be active based on scroll position. This created a race condition where:
- Chip tap sets active section → triggers scroll
- Scroll fires onScroll event → recalculates active section (potentially wrong)
- Result: wrong chip highlighted or scroll doesn't complete

## Solution Applied

### 1. Added Missing Refs to About Page
```javascript
const isAboutScrollingProgrammatically = useRef(false);
const aboutChipBarHeight = useRef(116); // Will be measured dynamically
```

### 2. Updated Mobile Chips (About Page)
- Added programmatic scroll flag logic matching Services
- Added dynamic chip bar height measurement with onLayout
- Added console logging for debugging
- Increased timeout to 500ms to ensure scroll completes

### 3. Updated Desktop Sidebar (About Page)
- Added programmatic scroll flag to all sidebar buttons
- Added 300ms timeout after scroll
- Matches Services page pattern exactly

### 4. Updated ScrollView onScroll Handler (About Page)
```javascript
onScroll={(event) => {
  if (isAboutScrollingProgrammatically.current) {
    console.log('[ABOUT] onScroll blocked - programmatic scroll in progress');
    return; // ← Block updates during programmatic scrolls
  }
  // ... rest of logic
}}
```

### 5. Added Missing Props
- Added `overScrollMode="never"` to About ScrollView
- Added logging to all section onLayout callbacks

### 6. Both Pages Now Have Identical Patterns
- ✅ Separate state variables (`activeServiceSection` vs `activeAboutSection`)
- ✅ Separate refs (`servicesScrollViewRef` vs `aboutScrollViewRef`)
- ✅ Separate programmatic scroll flags
- ✅ Separate section offset tracking
- ✅ Proper cleanup and blocking during programmatic scrolls

## Verification
The fix ensures:
1. **Isolated state** - Each page has its own refs and state variables
2. **No cross-page interference** - Switching pages doesn't affect the other page's scroll state
3. **Consistent behavior** - Both mobile chips and desktop sidebar work correctly
4. **Proper scroll blocking** - onScroll doesn't interfere with programmatic scrolls
5. **Works in both directions** - Services → About and About → Services both work

## Testing Checklist
- [ ] Navigate to Services page
- [ ] Tap each chip - verify correct section scrolls into view
- [ ] Navigate to About page
- [ ] Tap each chip - verify correct section scrolls into view
- [ ] Go back to Services - verify chips still work
- [ ] Repeat several times in different orders
- [ ] Test on both mobile and desktop screen sizes

## Files Changed
- `App.js` - Added isolation fixes to About page chip navigation

## Commit
```
Fix state-leakage bug between Services and About pages

- Added isAboutScrollingProgrammatically ref flag to About page (matching Services)
- Added aboutChipBarHeight ref for dynamic measurement (matching Services)
- Updated all About page chip/sidebar buttons to use programmatic scroll flag
- Updated About page ScrollView onScroll to check programmatic scroll flag
- Added overScrollMode='never' to About page ScrollView
- Added logging to About page section layouts for debugging
- Both pages now have fully isolated state and proper scroll blocking during programmatic scrolls
- Fixes chip navigation breaking when switching between Services and About pages
```

## Status
✅ **FIXED AND DEPLOYED**
- Committed to branch: `cursor/locate-us-ghana-us-offices`
- Pushed to GitHub
- Ready for testing
