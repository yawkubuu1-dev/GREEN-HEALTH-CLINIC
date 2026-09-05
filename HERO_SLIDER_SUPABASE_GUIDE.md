# Hero Slider - Fully Supabase Controlled

The hero slider has been completely rebuilt to be controlled from Supabase with no hardcoded content.

## ✅ Implementation Complete

### **1. New Component File**
- **Location:** `components/HeroSlider.jsx`
- **Features:**
  - Fetches slides and settings from Supabase on mount
  - Supports both image and video slides
  - Per-slide duration control
  - Per-slide autoplay override
  - Global loop and cycle settings
  - Customizable CTA buttons
  - Error handling with visible fallback messages
  - Uses native HTML `<img>` and `<video>` on web for better performance
  - Fixed animation bugs with `useNativeDriver: Platform.OS !== 'web'`

### **2. Mounted on Shop Page Only**
- **Location:** `App.js` line ~10040
- Only renders on the Shop screen
- Positioned above category filters and product grid
- Does not appear on Cart, Sign In, Product Detail, or other screens

### **3. Database Structure**

#### **hero_slides table**
Required columns:
- `id` - Unique identifier
- `type` - 'image' or 'video'
- `url` - Image or video URL
- `caption` - Main heading text
- `brand_text` - Small uppercase text at top
- `position` - Display order (ascending)
- `is_active` - Show/hide slide
- `duration_ms` - How long to display (milliseconds)
- `cta_primary_text` - Primary button text
- `cta_primary_link` - Primary button URL
- `cta_secondary_text` - Secondary button text
- `cta_secondary_link` - Secondary button URL
- `autoplay` - Enable/disable auto-advance for this slide

#### **hero_settings table**
Single row (id = 1) controls global behavior:
- `loop_infinite` - Loop forever (true) or stop after max_cycles (false)
- `max_cycles` - Number of full cycles before stopping (ignored if loop_infinite = true)
- `default_duration_ms` - Fallback duration if slide.duration_ms is null
- `transition_duration_ms` - Fade animation duration

## 🔧 Setup Instructions

### **Step 1: Run SQL Migration**

Open Supabase SQL Editor and run:
```sql
-- See: hero_slider_full_supabase_migration.sql
```

This will:
- Add required columns to `hero_slides`
- Create `hero_settings` table
- Set up RLS policies for public read access
- Insert default settings

### **Step 2: Add Your Slides**

In Supabase Table Editor (`hero_slides`):
1. Add/edit slide rows
2. Set `url` to your image/video URL
3. Set `caption` and `brand_text`
4. Set `cta_primary_text` and `cta_secondary_text`
5. Set `duration_ms` (e.g., 5000 for 5 seconds)
6. Set `position` (1, 2, 3, etc. for display order)
7. Set `is_active` to `true`
8. Set `autoplay` to `true` (or `false` to pause auto-advance)

### **Step 3: Configure Settings**

In Supabase Table Editor (`hero_settings`):
- Edit the single row (id = 1)
- Set `loop_infinite` to `true` for endless loop
- Or set `max_cycles` to stop after X cycles
- Set `default_duration_ms` (default: 5000)
- Set `transition_duration_ms` (default: 400)

### **Step 4: Refresh App**

No code changes needed! The slider will automatically:
- Load your slides from Supabase
- Apply your settings
- Display on the Shop page

## 🎯 Features

### **Dynamic Content**
- All text loaded from database
- No hardcoded slides
- Change content without code deployment

### **Per-Slide Control**
- Custom duration per slide
- Disable autoplay for specific slides
- Individual CTA buttons per slide

### **Global Settings**
- Control loop behavior
- Set default timing
- Configure transition speed

### **Error Handling**
- Visible "Image failed to load" message
- Loading placeholder during fetch
- Error messages for failed queries

### **Performance**
- Native HTML `<img>` on web (faster than React Native Image)
- Native HTML5 `<video>` with autoplay, muted, loop
- Optimized animations with proper native driver handling

## 📝 Testing

After setup, verify:
1. ✅ Hero slider appears on Shop page
2. ✅ Slides auto-advance based on `duration_ms`
3. ✅ Manual arrows and dots work
4. ✅ Changing `duration_ms` in Supabase changes timing immediately
5. ✅ Setting `is_active = false` hides a slide
6. ✅ Setting `autoplay = false` pauses auto-advance on that slide
7. ✅ Images and videos load correctly
8. ✅ CTA buttons display with correct text
9. ✅ Hero slider does NOT appear on other pages (Cart, Sign In, etc.)

## 🔄 Making Changes

### **Add a New Slide**
1. Go to Supabase → hero_slides table
2. Insert new row
3. Fill in all fields
4. Set `is_active = true`
5. Refresh app

### **Change Slide Order**
1. Update `position` column values
2. Refresh app

### **Change Loop Behavior**
1. Go to Supabase → hero_settings table
2. Edit row (id = 1)
3. Toggle `loop_infinite` or change `max_cycles`
4. Refresh app

### **Change Default Timing**
1. Go to Supabase → hero_settings table
2. Edit `default_duration_ms`
3. Refresh app

No code deployment needed for any of these changes!
