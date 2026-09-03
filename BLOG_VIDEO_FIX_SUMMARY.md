# Blog Videos in Supabase - Fix Summary

## Problem
Blog videos were not showing in the app because:
1. The BlogPage component was using hardcoded `BLOG_POSTS` array instead of fetching from Supabase
2. The `blog_posts` table didn't have video-specific fields (video_id, video_thumbnail, video_duration)

## Solution

### 1. Database Schema Update
**File:** `add_video_fields_to_blog.sql`

Added video fields to the blog_posts table:
- `video_id` TEXT - YouTube video ID
- `video_thumbnail` TEXT - Thumbnail URL
- `video_duration` TEXT - Duration string (e.g., "5:42")
- `content_type` TEXT - Either 'article' or 'video'

### 2. Sample Video Data
The SQL script inserts 5 sample video blog posts:
1. Understanding Functional Medicine (5:42)
2. Metabolic Health 101 (7:18)
3. The Gut–Brain Connection (6:05)
4. Chronic Inflammation (8:33)
5. Lab Tests That Actually Matter (5:20)

### 3. App Code Updates
**File:** `App.js`

#### BlogPage Component Changes:
- Added `useEffect` to fetch blog posts from Supabase using `blogService.getAll()`
- Added `loading` state with ActivityIndicator
- Falls back to static `BLOG_POSTS` if Supabase fetch fails
- Now uses `blogPosts` state instead of hardcoded array

#### BlogCard Component Changes:
- Now supports both static data format and Supabase format
- Maps fields: `video_thumbnail || thumbnail || featured_image_url` → thumbnail
- Maps fields: `video_duration || duration` → duration
- Maps fields: `category_name || category` → category

#### Video Modal Changes:
- Updated to use `video_id || videoId` for YouTube embed
- Updated to use `category_name || category` for category display
- Updated to use `video_duration || duration` for duration
- Updated to format `published_at` date if `date` not present

## How to Deploy

### Step 1: Run SQL Migration
In your Supabase SQL Editor, run:
```sql
-- Run this file
add_video_fields_to_blog.sql
```

This will:
1. Add video fields to blog_posts table
2. Insert 5 sample video posts
3. Verify the data was inserted correctly

### Step 2: Deploy App Changes
The App.js changes are already made. Just refresh your app or restart the dev server.

### Step 3: Verify
1. Navigate to the Blog page in your app
2. You should see video thumbnails with play buttons
3. Click a video to open the YouTube player modal
4. Search should work to filter videos by title

## Database Structure

### blog_posts Table (Video Posts)
```
id               UUID
title            TEXT
slug             TEXT (unique)
excerpt          TEXT
content          TEXT
featured_image_url TEXT
video_id         TEXT           ← NEW
video_thumbnail  TEXT           ← NEW
video_duration   TEXT           ← NEW
content_type     TEXT           ← NEW ('video' or 'article')
category_id      UUID (FK)
author_id        UUID (FK)
status           TEXT ('published', 'draft', 'archived')
is_featured      BOOLEAN
published_at     TIMESTAMP
created_at       TIMESTAMP
updated_at       TIMESTAMP
```

## Field Mapping Reference

| UI Needs | Supabase Field | Fallback |
|----------|---------------|----------|
| Thumbnail | `video_thumbnail` | `featured_image_url` |
| Duration | `video_duration` | - |
| Category | `category_name` (from JOIN) | - |
| Video ID | `video_id` | - |
| Date | `published_at` | - |

## Admin Management

To add more videos via Supabase:

```sql
INSERT INTO public.blog_posts 
  (title, slug, excerpt, video_id, video_thumbnail, video_duration,
   content_type, category_id, status, is_featured, published_at)
VALUES
  (
    'Your Video Title',
    'your-video-slug',
    'Video description...',
    'YOUTUBE_VIDEO_ID',
    'https://img.youtube.com/vi/YOUTUBE_VIDEO_ID/maxresdefault.jpg',
    '12:34',
    'video',
    (SELECT id FROM blog_categories WHERE slug = 'health-tips' LIMIT 1),
    'published',
    true,
    now()
  );
```

## Notes
- The app maintains backward compatibility with the static `BLOG_POSTS` array
- If Supabase fetch fails, it falls back to static data
- Video posts and article posts can coexist in the same table
- Use `content_type = 'video'` to filter only video posts if needed
