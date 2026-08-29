# Services Page Chip Navigation Debug Guide

## Problem
The Services page chip navigation was bouncing back and forth between sections after tapping a chip, indicating a scroll conflict where multiple systems were fighting for control.

## Changes Made

### 1. Dynamic Sticky Height Measurement
**Before:** Hardcoded `STICKY_HEIGHT = 116`
**After:** Dynamically measured via `onLayout` callback on the chip bar

```javascript
const servicesChipBarHeight = useRef(116); // Default, will be measured

<ScrollView
  onLayout={(e) => {
    const measuredHeight = e.nativeEvent.layout.height;
    servicesChipBarHeight.current = measuredHeight;
  }}
  // ... chip bar ScrollView
```

**Why:** If the actual chip bar height differs from 116px (due to padding, font size, or device scaling), the scroll target calculation will be wrong, causing the scroll to overshoot or undershoot.

### 2. Increased Timeout Duration
**Before:** 300ms timeout
**After:** 500ms timeout

```javascript
setTimeout(() => { 
  isServicesScrollingProgrammatically.current = false; 
}, 500);
```

**Why:** On some devices, the scroll animation and subsequent onScroll events may take longer than 300ms to settle. If the programmatic scroll flag is released too early, the scroll handler will detect the wrong active section mid-scroll and trigger another scroll.

### 3. Comprehensive Console Logging

#### Chip Tap Events
```
[SERVICES] Chip tapped: metabolic-health
[SERVICES] Scrolling to metabolic-health: raw=523.5, stickyHeight=116, target=407.5
[SERVICES] Unlocking programmatic scroll flag for metabolic-health
```

#### Scroll Events
```
[SERVICES] onScroll: offsetY=407.5, calculated active=metabolic-health
[SERVICES] Active section changing: functional-medicine -> metabolic-health
```

#### Layout Changes
```
[SERVICES] metabolic-health layout changed: 523.5 -> 525.0
```

#### Blocked Scrolls
```
[SERVICES] onScroll blocked - programmatic scroll in progress
```

## How to Use the Logs to Debug

### Test on Mobile Device
1. Open the app on a phone (physical device or emulator)
2. Navigate to the Services page
3. Open the browser console or React Native debugger
4. Tap a chip (e.g., "Metabolic Health")

### What to Look For

#### ✅ Healthy Behavior
```
[SERVICES] Chip tapped: metabolic-health
[SERVICES] Scrolling to metabolic-health: raw=523, stickyHeight=48, target=475
[SERVICES] onScroll blocked - programmatic scroll in progress  (may appear multiple times)
[SERVICES] Unlocking programmatic scroll flag for metabolic-health
[SERVICES] onScroll: offsetY=475.0, calculated active=metabolic-health
```

**Pattern:** 
- One chip tap
- Scroll target calculated
- Multiple blocked scroll events (good - means flag is working)
- Flag unlocked after 500ms
- Final onScroll event detects correct section

#### ❌ Bouncing Behavior
```
[SERVICES] Chip tapped: metabolic-health
[SERVICES] Scrolling to metabolic-health: raw=523, stickyHeight=48, target=475
[SERVICES] onScroll: offsetY=475.0, calculated active=chronic-disease  ← WRONG!
[SERVICES] Active section changing: metabolic-health -> chronic-disease
[SERVICES] Scrolling to chronic-disease: raw=850, stickyHeight=48, target=802  ← AUTO-SCROLL
[SERVICES] onScroll: offsetY=802.0, calculated active=metabolic-health  ← BACK TO ORIGINAL
[SERVICES] Active section changing: chronic-disease -> metabolic-health
[SERVICES] Scrolling to metabolic-health: raw=523, stickyHeight=48, target=475  ← LOOP!
```

**Pattern:**
- Scroll completes but detects WRONG section
- Automatically scrolls to that wrong section
- Detects original section again
- Infinite loop

### Root Causes to Check

#### 1. Sticky Height Mismatch
**Symptom:** Chip bar measured height doesn't match 116px
```
[SERVICES] Chip bar height measured: 58px  ← NOT 116!
```

**Solution:** The code now uses the measured height automatically. If this log shows a different value, that was the bug.

#### 2. Layout Thrashing
**Symptom:** Section offsets changing during scroll
```
[SERVICES] metabolic-health layout changed: 523 -> 525
[SERVICES] metabolic-health layout changed: 525 -> 523
[SERVICES] metabolic-health layout changed: 523 -> 526
```

**Solution:** This indicates re-renders are causing layout shifts. Check if:
- Font is loading late
- Images are loading and pushing content down
- Parent container size is unstable

#### 3. Timeout Too Short
**Symptom:** onScroll events NOT blocked
```
[SERVICES] Chip tapped: metabolic-health
[SERVICES] onScroll: offsetY=200.0, calculated active=functional-medicine  ← NOT BLOCKED!
[SERVICES] Active section changing: metabolic-health -> functional-medicine
```

**Solution:** If you see onScroll events immediately after chip tap (without "blocked" message), increase timeout beyond 500ms.

#### 4. Race Condition Between State and Ref
**Symptom:** Active section changes BEFORE scroll completes
```
[SERVICES] Chip tapped: metabolic-health
[SERVICES] Active section changing: functional-medicine -> metabolic-health  ← TOO FAST
[SERVICES] Scrolling to metabolic-health: raw=523, stickyHeight=48, target=475
```

**Solution:** The `setActiveServiceSection` call is synchronous and happens before scroll. This is intentional, but if it triggers a re-render that changes section offsets, that's the bug.

## Next Steps If Still Broken

### If bouncing persists:
1. Check console logs for the patterns above
2. Verify `servicesChipBarHeight.current` matches visual height
3. Check if section offsets are stable (no layout thrashing)
4. Try increasing timeout to 800ms or 1000ms
5. Consider using `animated: true` with `onScrollEndDrag` handler instead

### Alternative Fix: Debounce the onScroll Handler
If the issue is excessive scroll events, debounce the active section detection:

```javascript
const lastScrollTime = useRef(0);

onScroll={(event) => {
  const now = Date.now();
  if (now - lastScrollTime.current < 100) return; // Ignore rapid events
  lastScrollTime.current = now;
  
  // ... rest of scroll logic
}}
```

### Alternative Fix: Use ScrollView.scrollToEnd with Refs
Instead of calculating offsets, measure each section with `measureLayout`:

```javascript
sectionRefs.current[item.key]?.measureLayout(
  findNodeHandle(servicesScrollViewRef.current),
  (x, y, width, height) => {
    servicesScrollViewRef.current?.scrollTo({ 
      y: y - servicesChipBarHeight.current, 
      animated: false 
    });
  }
);
```

## Summary
The fix targets three potential causes:
1. **Wrong offset calculation** → Dynamic height measurement
2. **Scroll not complete** → Longer timeout (500ms)
3. **Mystery behavior** → Comprehensive logging

Test on a mobile device and watch the console logs to identify which fix resolved the issue (or if further debugging is needed).
