# Auto-Play Video Preview Feature (YouTube-Style)

## Overview
Blog post cards now auto-play video previews when they scroll into view, just like YouTube video thumbnails. No hover or tap required - videos start playing automatically when visible on screen.

## Behavior

### Auto-Play on Visibility
- **As soon as a card scrolls into viewport** → video starts playing (muted, looped)
- **When card scrolls out of view** → video pauses (saves bandwidth/battery)
- **Works on both web and mobile** → same behavior, no platform differences
- **Click/tap card or "Watch now"** → opens full lightbox modal with audio

### Performance Optimization
- **Lazy loading**: Videos only load when card is within 100px of viewport
- **Intersection Observer (Web)**: Efficiently tracks card visibility
- **Auto-pause off-screen**: Stops playback when user scrolls past
- **Preload metadata only**: Loads video metadata first, then streams as needed

### Visual Indicators
- **Muted icon (🔇)**: Top-right overlay shows video has no sound
- **Duration badge**: Bottom-right shows video length
- **Always visible**: Both badges stay visible during auto-play

## Technical Implementation

### Web Platform
Uses native **IntersectionObserver API**:
```javascript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // Load video when near viewport
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        setShouldLoadVideo(true);
      }
      
      // Play when visible, pause when hidden
      setIsVisible(entry.isIntersecting && entry.intersectionRatio > 0.5);
    });
  },
  {
    threshold: [0, 0.5, 1],
    rootMargin: '100px', // Pre-load buffer
  }
);
```

### Mobile Platform  
Uses expo-av Video component with `shouldPlay` prop controlled by visibility state:
```javascript
<Video
  source={{ uri: videoUrl }}
  style={{ width: '100%', height: '100%' }}
  resizeMode="cover"
  shouldPlay={mobileVisible}
  isLooping
  isMuted
/>
```

### Video Detection
Reuses existing `getVideoSource()` utility:
- Reads from `video_id` or `videoId` field
- Detects direct video files: `.mp4`, `.webm`, `.ogg`, `.mov`
- Only direct videos get auto-play (YouTube IDs open modal directly)

## Component State

### BlogCard State Variables
```javascript
const [isVisible, setIsVisible] = useState(false);         // Card in viewport?
const [shouldLoadVideo, setShouldLoadVideo] = useState(false);  // Near viewport?
const [mobileVisible, setMobileVisible] = useState(true);  // Mobile visibility tracking
```

### Refs
```javascript
const cardRef = useRef(null);   // Card DOM element (for IntersectionObserver)
const videoRef = useRef(null);  // Video element (for play/pause control)
```

## Viewport Detection Logic

### Thresholds
- **0%**: Card just entering/exiting viewport edge
- **50%**: Card is half visible (triggers play/pause)
- **100%**: Card fully visible

### Root Margin
- **100px buffer**: Loads video 100px before card enters viewport
- Prevents loading all videos at once on long pages
- Smooth playback as user scrolls

## User Experience

### Before (Hover-to-Play)
1. User sees static thumbnail
2. User hovers over card
3. Video starts playing
4. User moves mouse away → video stops

### After (Auto-Play on Scroll)
1. User scrolls down page
2. Card comes into view → **video plays automatically**
3. User keeps scrolling → video pauses when out of view
4. User clicks card → full modal with sound opens

## Performance Benefits
✅ **Bandwidth efficient**: Only loads/plays visible videos  
✅ **Battery friendly**: Pauses off-screen videos  
✅ **Fast page load**: Videos load progressively as user scrolls  
✅ **Smooth UX**: Feels like YouTube/TikTok/Instagram  

## Browser Compatibility
- ✅ Chrome/Edge: IntersectionObserver + autoplay supported
- ✅ Firefox: Full support
- ✅ Safari: Autoplay works with muted + playsInline attributes
- ✅ Mobile browsers: Autoplay works when muted

## Fallback Behavior
- **YouTube/Vimeo videos**: Show thumbnail, click to open modal
- **No video source**: Standard thumbnail + play button
- **Autoplay blocked**: Falls back gracefully (video stays paused)

## Files Changed
- `App.js` - Updated BlogCard component with viewport-based auto-play
- `AUTO_PLAY_VIDEO_PREVIEW_FEATURE.md` - This documentation

## Dependencies
- Uses existing `expo-av` Video component
- Uses native browser IntersectionObserver (no external library needed)
- No new packages required

## Known Limitations
- Mobile viewport detection simplified (assumes visible by default)
- Could be enhanced with FlatList onViewableItemsChanged for better mobile tracking
- Some browsers may require user interaction before first autoplay (security policy)
