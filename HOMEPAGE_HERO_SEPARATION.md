# Homepage Hero Separation - Implementation Summary

## Overview
The homepage hero is now a completely independent, standalone feature — fully separate from the Shop page's Hero Slider in every respect. They can be changed, broken, or removed independently without affecting each other.

## Architecture

### Homepage Hero
- **Component**: `components/HomeHero.jsx`
- **Database Table**: `public.home_hero` (single row, id=1)
- **Purpose**: Single static hero image for homepage only
- **Features**:
  - Dynamic aspect ratio detection (no image cropping)
  - Fetches content from dedicated `home_hero` table
  - Smooth fade-in entrance animation
  - Responsive design (mobile/desktop)
  - CTA buttons with navigation

### Shop Page Hero Slider
- **Component**: `components/HeroSlider.jsx`
- **Database Tables**: `public.hero_slides` + `public.hero_settings`
- **Purpose**: Multi-slide carousel for shop page only
- **Features**:
  - Auto-rotating slides (images/videos)
  - Dynamic aspect ratio per slide
  - Pagination dots
  - Manual navigation controls
  - Configurable timing/transitions

## Zero Shared Code
- ✅ No shared components
- ✅ No shared database tables
- ✅ No shared logic or utilities
- ✅ No imports between the two
- ✅ Independent styling
- ✅ Separate data fetching

## Database Schema

### `public.home_hero` (Homepage only)
```sql
CREATE TABLE public.home_hero (
  id BIGINT PRIMARY KEY DEFAULT 1,
  image_url TEXT NOT NULL,
  heading TEXT NOT NULL,
  subheading TEXT,
  primary_button_text TEXT,
  primary_button_link TEXT,
  secondary_button_text TEXT,
  secondary_button_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_home_hero CHECK (id = 1)
);
```

### `public.hero_slides` (Shop page only)
Existing multi-slide carousel table - unchanged

### `public.hero_settings` (Shop page only)
Existing carousel settings table - unchanged

## Files Changed

### Created
1. `components/HomeHero.jsx` - Standalone homepage hero component
2. `create_home_hero_table.sql` - Database migration for home_hero table
3. `HOMEPAGE_HERO_SEPARATION.md` - This documentation

### Modified
1. `App.js`:
   - **Added**: `import HomeHero from './components/HomeHero';` (line ~42)
   - **Replaced**: Homepage hero JSX (lines ~8650-8773) with `<HomeHero isPhone={isPhoneScreen} />`
   - **Removed**: Old homepage hero state/refs (lines ~4794-4803)
   - **Removed**: Old homeHero styles (lines ~13001-13087)

### Unchanged
1. `components/HeroSlider.jsx` - Shop page slider unchanged
2. Database tables `hero_slides` and `hero_settings` - unchanged

## Dynamic Aspect Ratio Solution

Both components now use the same approach to prevent image cropping:

### Web Platform
```javascript
// Native <img> element for better performance
{React.createElement('img', {
  src: imageUrl,
  onLoad: (e) => {
    const ratio = e.target.naturalWidth / e.target.naturalHeight;
    setAspectRatio(ratio);
  },
  style: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Works perfectly with dynamic container
  }
})}
```

### Native Platforms (iOS/Android)
```javascript
useEffect(() => {
  Image.getSize(imageUrl, (width, height) => {
    setAspectRatio(width / height);
  });
}, [imageUrl]);
```

### Result
- Container uses `aspectRatio: calculatedRatio` instead of fixed height
- Full image displays without cropping
- Responsive across all screen sizes
- Default aspect ratio (21/9) prevents layout jump during load

## Content Management

### Homepage Hero
Edit directly in Supabase `home_hero` table (id=1):
- `image_url` - Hero background image
- `heading` - Main title
- `subheading` - Subtitle/description
- `primary_button_text` / `primary_button_link` - Primary CTA
- `secondary_button_text` / `secondary_button_link` - Secondary CTA
- `is_active` - Enable/disable hero

### Shop Hero Slider
Edit in Supabase `hero_slides` + `hero_settings` tables:
- Multiple slides with images/videos
- Individual slide timing/transitions
- Global carousel settings

## Deployment Steps

1. ✅ Create `components/HomeHero.jsx`
2. ✅ Modify `App.js` to use HomeHero component
3. ✅ Remove old homepage hero code from App.js
4. ⏳ **Run SQL migration in Supabase**:
   - Open Supabase SQL Editor
   - Run `create_home_hero_table.sql`
   - Insert initial homepage hero data
5. ⏳ Commit and push changes
6. ⏳ Test homepage and shop page independently

## Testing Checklist

### Homepage
- [ ] Hero displays on homepage only
- [ ] Image loads without cropping
- [ ] Text and buttons render correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Fade-in animation works
- [ ] CTA buttons navigate correctly

### Shop Page
- [ ] Hero Slider displays on shop page only
- [ ] Multiple slides rotate correctly
- [ ] Images/videos don't crop
- [ ] Pagination dots work
- [ ] Manual navigation works
- [ ] Independent from homepage hero

### Separation Verification
- [ ] Editing home_hero table only affects homepage
- [ ] Editing hero_slides table only affects shop page
- [ ] HomeHero component has no HeroSlider imports
- [ ] Database tables are completely separate

## Next Steps

1. Run `create_home_hero_table.sql` in Supabase SQL Editor
2. Commit with message: "Replace homepage hero with standalone HomeHero component - completely separate from Shop Hero Slider"
3. Push to branch: `cursor/locate-us-ghana-us-offices`
4. Test both pages thoroughly
5. Verify content updates work via Supabase admin panel

## Technical Notes

- **Aspect Ratio Approach**: Dynamic detection prevents cropping while maintaining performance
- **Platform Differences**: Web uses native `<img>`, native uses React Native `Image.getSize()`
- **Default Fallback**: 21:9 aspect ratio during image load prevents layout shift
- **Animation**: Homepage hero uses simple fade-in; Shop slider uses timed transitions
- **Independence**: Zero coupling ensures changes to one never affect the other
