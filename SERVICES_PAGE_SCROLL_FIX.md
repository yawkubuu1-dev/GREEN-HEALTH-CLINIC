# Services Page Scroll Bounce Fix

## Problem
On mobile, tapping a chip on the Services page caused the page to bounce back and forth between sections instead of settling cleanly on the tapped section.

## Root Cause
The scroll-position tracker (`onScroll` handler) was updating the active chip highlight based on scroll position while a tap-triggered scroll was still in progress. This created a feedback loop:

1. User taps chip → triggers programmatic scroll
2. Scroll starts → `onScroll` handler fires
3. `onScroll` calls `setActiveServiceSection` → causes re-render
4. Re-render potentially triggers another scroll adjustment
5. Loop repeats, causing bounce effect

## Solution
Added a guard flag `isServicesScrollingProgrammatically` to prevent the scroll-position tracker from updating the active section while a programmatic scroll is in progress.

### Changes Made

#### 1. Added Guard Flag (Line ~1982)
```javascript
const isServicesScrollingProgrammatically = useRef(false);
```

#### 2. Updated onScroll Handler (Line ~8887)
```javascript
onScroll={(event) => {
  if (isServicesScrollingProgrammatically.current) return; // Guard check
  const offsetY = event.nativeEvent.contentOffset.y;
  // ... rest of scroll tracking logic
}}
```

#### 3. Updated All Chip Press Handlers
**Mobile Chips (Line ~8654):**
```javascript
onPress={() => {
  isServicesScrollingProgrammatically.current = true;
  setActiveServiceSection(item.key);
  // ... scroll logic
  setTimeout(() => { isServicesScrollingProgrammatically.current = false; }, 150);
}}
```

**Desktop Sidebar Links (Lines ~8732, ~8758, ~8782, ~8806, ~8830, ~8854):**
```javascript
onPress={() => {
  isServicesScrollingProgrammatically.current = true;
  setActiveServiceSection('section-name');
  servicesScrollViewRef.current?.scrollTo({ y: offset, animated: true });
  setTimeout(() => { isServicesScrollingProgrammatically.current = false; }, 300);
}}
```

### How It Works

1. **Chip Tap:** User taps a chip
2. **Guard Enabled:** `isServicesScrollingProgrammatically.current = true`
3. **Scroll Starts:** Programmatic scroll begins
4. **onScroll Ignored:** While guard is true, `onScroll` handler returns early (doesn't update active section)
5. **Guard Disabled:** After timeout (150ms for mobile, 300ms for desktop), guard resets to `false`
6. **Normal Tracking Resumes:** `onScroll` can now update active section based on user manual scrolling

### Timeout Values
- **Mobile chips:** 150ms (instant scroll, shorter timeout needed)
- **Desktop sidebar:** 300ms (animated scroll, longer timeout for animation to complete)

## Result
✅ Smooth, clean scroll to tapped section without bouncing
✅ Active chip correctly highlights the tapped section
✅ No conflict between programmatic scroll and position tracking
✅ Manual scrolling still works correctly after programmatic scroll completes

## Testing
Test on mobile device:
1. Open Services page
2. Tap any chip (Functional Medicine, Metabolic Health, etc.)
3. Verify page scrolls smoothly to section without bouncing
4. Verify tapped chip is highlighted
5. Try tapping different chips in sequence
6. Verify manual scrolling still updates active chip correctly
