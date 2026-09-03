# Inline Video Preview Feature

## Overview
Added inline video preview functionality to blog post cards, allowing users to preview videos directly in the grid without opening the full modal.

## Features Implemented

### 1. **Web Behavior (Hover to Play)**
- Hovering over a blog card with a direct video file (.mp4, .webm, .ogg, .mov) starts playing the video muted and looping
- Video replaces the thumbnail during hover
- Mouse leave pauses the video and reverts to thumbnail
- Play button and duration badge hidden during inline playback

### 2. **Mobile Behavior (Tap to Play)**
- Tapping the play button on a card with direct video plays it inline (muted, looping)
- Shows "Tap for sound" affordance that opens the full lightbox modal with audio
- Inline preview stays until user taps to open full modal or navigates away
- Non-direct videos (YouTube IDs) skip inline preview and open modal directly

### 3. **Shared Video Detection Logic**
Created `getVideoSource()` utility function that:
- Reads from `video_id` or `videoId` field
- Detects direct video files using regex: `/\.(mp4|webm|ogg|mov)(\?|$)/i`
- Separates direct video URLs from YouTube IDs
- Used by both BlogCard and video modal (no duplication)

## Technical Implementation

### Components Updated

#### **BlogCard Component**
```javascript
function BlogCard({ post, flex, isUserDarkMode, surface, charcoal, green, greenSoft, border, isPhoneScreen, onPlay })
```

**New State:**
- `isHovered` - Tracks hover state for web
- `inlinePlayingMobile` - Tracks inline playback on mobile
- `videoRef` - Reference to video element for play/pause control

**New Handlers:**
- `handleMouseEnter()` - Web: starts inline video playback
- `handleMouseLeave()` - Web: pauses video and resets
- `handlePlayButtonPress()` - Mobile: toggles inline playback / opens modal

**Conditional Rendering:**
- Thumbnail always rendered as base layer
- Video overlays thumbnail when `showVideo` is true
- Play button and duration badge hidden during inline playback
- Mobile: "Tap for sound" affordance shown during inline playback

### **Video Modal**
Updated to use `getVideoSource()` utility instead of inline logic.

### New Utility Function

```javascript
function getVideoSource(post) {
  const rawSource = post.video_id || post.videoId || '';
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(rawSource);
  const videoUrl = isDirectVideo ? rawSource : '';
  const videoId = isDirectVideo ? '' : rawSource;
  
  return { rawSource, isDirectVideo, videoUrl, videoId };
}
```

## User Experience

### Web (Desktop/Laptop)
1. User hovers over blog card
2. If video is direct MP4/WebM/OGG/MOV:
   - Video starts playing muted
   - Thumbnail fades out
   - Play button and duration badge disappear
3. User moves mouse away → video pauses, thumbnail returns
4. Clicking anywhere on card opens full modal with sound

### Mobile (iOS/Android)
1. User taps play button on card
2. If video is direct MP4/WebM/OGG/MOV:
   - Video plays inline (muted, looping)
   - "Tap for sound" affordance appears
3. Tapping affordance → opens full modal with controls and audio
4. If video is YouTube ID → skips inline, opens modal directly

## Fallback Behavior
- YouTube videos: No inline preview, always opens modal
- Vimeo/Mux/other embeds: No inline preview, always opens modal
- Missing video source: Standard play button behavior

## Benefits
- ✅ Better user engagement - preview before committing to full playback
- ✅ Consistent with modern video platforms (YouTube, TikTok, Instagram)
- ✅ No duplicate code - single source of truth for video detection
- ✅ Progressive enhancement - falls back gracefully for non-direct videos
- ✅ Mobile-friendly - tap-to-preview keeps users in context

## Files Changed
- `App.js` - Added inline video preview to BlogCard, created getVideoSource utility

## Dependencies
- Uses existing `expo-av` Video component (already installed)
- Uses existing React `createElement` for web video element
- No new packages required
