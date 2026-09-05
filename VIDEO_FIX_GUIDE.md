# Video Playback Error Fix Guide

## Problem
Videos showing error: "An error occurred. Please try again later. (Playback ID: JhlBbhLYPiX_tkPv)"

This error occurs when:
- Video uses Mux player which requires authentication
- Video URL is broken or expired
- Video format is not supported by the embedded player

## Solution

### Option 1: Update to YouTube Videos (Recommended)

1. **Find free pharmacy/medicine videos on YouTube:**
   - Search for: "pharmacy medicine tutorial", "how to take medication", "pharmacy inventory management"
   - Get the video ID from URL: `https://www.youtube.com/watch?v=VIDEO_ID_HERE`

2. **Run the fix SQL in Supabase:**

```sql
-- Check current videos
SELECT id, title, video_id, video_url 
FROM public.blog_posts 
WHERE video_url IS NOT NULL;

-- Update with YouTube videos
UPDATE public.blog_posts
SET 
  video_id = 'YOUR_YOUTUBE_VIDEO_ID',
  video_url = 'https://www.youtube.com/watch?v=YOUR_YOUTUBE_VIDEO_ID'
WHERE id = 'POST_ID_HERE';
```

### Option 2: Remove Broken Videos

```sql
-- Clear all broken video URLs
UPDATE public.blog_posts
SET video_id = NULL, video_url = NULL
WHERE video_url LIKE '%mux.com%' OR video_url LIKE '%stream.mux%';
```

### Option 3: Use Direct MP4 Videos

```sql
-- Update with direct video file URLs
UPDATE public.blog_posts
SET 
  video_id = NULL,
  video_url = 'https://your-cdn.com/videos/pharmacy-tutorial.mp4'
WHERE id = 'POST_ID_HERE';
```

## Code Changes Made

Updated `App.js` to:
- ✅ Add Mux video detection
- ✅ Show friendly error message for unsupported videos
- ✅ Fix YouTube video detection logic
- ✅ Better null/empty URL handling

## Testing

1. Run one of the SQL fixes above in Supabase
2. Refresh your app
3. Click on a blog post video
4. Video should play without errors

## Recommended YouTube Videos for Pharmacy App

Search YouTube for:
- "How to read prescription labels"
- "Medication safety tips"
- "Pharmacy tour and services"
- "Over the counter medicine guide"
- "How pharmacies work"

Copy the video ID (11 characters after `v=`) and update your database.

## Need Help?

If videos still don't play:
1. Check browser console for errors (F12)
2. Verify video_id and video_url in Supabase
3. Test video URL directly in browser
4. Ensure video is publicly accessible (not private/unlisted on YouTube)
