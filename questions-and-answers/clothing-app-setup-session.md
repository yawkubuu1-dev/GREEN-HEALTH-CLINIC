# Prolyn Wear Clothing App Setup - Q&A Session

**Date:** June 25, 2026

---

## Q1: How do I change the branding from "Osebo-Shoes" to "Prolyn Wear"?

**A:** Updated the following files:
- `app.json` - Changed app name, slug, bundle identifiers, and web configuration
- `App.js` - Replaced all occurrences of "Osebo-Shoes" with "Prolyn Wear" in UI texts
- `components/MapComponent.js` - Updated store location names and messages
- `components/StoreLocator.js` - Updated store names and descriptions
- `utils/whatsappHelper.js` - Updated brand name in WhatsApp messages

---

## Q2: How do I get the SQL code for a clothing wear app?

**A:** Created `prolyn_wear_clothing_seed.sql` with:
- Clothing-focused categories (T-Shirts, Jeans, Dresses, Jackets, etc.)
- Product pricing structure for clothing sizes (S, M, L, XL, XXL)
- 30 clothing items with appropriate mockup data
- Updated branding to "Prolyn Wear"
- Admin email: `admin@prolynwear.com`

**To run:** Go to Supabase dashboard → SQL Editor → Paste the file → Click "Run"

---

## Q3: How do I connect the app to the new Supabase tables?

**A:** 
1. Update `.env` file with your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anonymous-key-here
```

2. Updated `App.js` to use clothing size pricing:
- Changed from shoe sizes (US 7-11) to clothing sizes (S, M, L, XL, XXL)
- Updated price columns: `price_s`, `price_m`, `price_l`, `price_xl`, `price_xxl`
- Updated admin product forms with clothing size pricing fields
- Updated UI labels from "SELECT WEIGHT" to "SELECT SIZE"

---

## Q4: How does the admin authentication system work?

**A:** Created three components:

**1. `hooks/useUserRole.js`** - Custom hook for fetching user roles:
```javascript
export function useUserRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  // Fetches role from profiles table
  return { role, loading, isAdmin: role === 'admin' };
}
```

**2. `components/AdminRoute.jsx`** - Route protection component:
```javascript
export function AdminRoute({ children }) {
  const { isAdmin, loading } = useUserRole();
  if (loading) return <Text>Loading...</Text>;
  if (!isAdmin) return <Text>Access Denied</Text>;
  return children;
}
```

**3. `screens/AdminDashboard.jsx`** - Protected admin dashboard

**Current App.js Implementation:**
- Uses `checkAdmin()` function to query profiles table
- Checks if `role === 'admin'`
- Sets `adminUnlocked` state for navigation
- Added console logging for debugging

---

## Q5: How does the Category/Promotion row work?

**A:** **Category Chips Row:**

**Data Source:**
```javascript
const fallbackChips = ['T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Hoodies', ...];
const [categoryChips, setCategoryChips] = useState(['All', ...fallbackChips]);
```

**Dynamic Loading:**
- Fetches from Supabase `categories` table
- Falls back to `fallbackChips` if database empty
- Always includes "All" option

**Filtering Logic:**
```javascript
const filteredProducts = productCards.filter((card) => {
  const selected = activeCategory === 'All' || 
                   card.categoryLabel === activeCategory;
  return selected && matchesQuery;
});
```

**Promotional Carousel:**
- Displays banners from `carousel_items` table
- Tapping promotion → clears filter → finds product → sets category

**Data Flow:**
```
Supabase Categories → categoryChips state → Render chips → 
User taps → setActiveCategory() → Filter products → Update grid
```

---

## Q6: What tag labels can be associated with promotional products?

**A:** Based on the `getBadgeColor()` function:

### 🟢 GREEN (New/Arrival)
- `NEW`, `ARRIVAL`, `FRESH`

### 🔴 RED (Sale/Promotion)
- `SALE`, `OFF`, `DISCOUNT`, `PROMO`

### 🟡 AMBER (Hot/Trending)
- `HOT`, `TRENDING`, `POPULAR`, `DEAL`

### 🔵 BLUE (Best Sellers)
- `BEST`, `SELLER`, `TOP`, `PICK`

### 🟣 PURPLE (Luxury/Premium)
- `LUXURY`, `PREMIUM`, `DESIGNER`

### ⚫ GRAY (Classic/Essential)
- `CLASSIC`, `ESSENTIAL`

### 🔴 DEFAULT (Oxblood)
- Any other text

**Usage:** Set the `tag` field when adding products in admin panel. Badge color auto-applies based on tag text.

---

## Files Created/Modified:

**Created:**
- `prolyn_wear_clothing_seed.sql` - Clothing database schema and seed data
- `hooks/useUserRole.js` - Admin authentication hook
- `components/AdminRoute.jsx` - Route protection component
- `screens/AdminDashboard.jsx` - Admin dashboard screen
- `screens/HomeScreen.jsx` - Home screen with admin navigation

**Modified:**
- `app.json` - Branding updates
- `App.js` - Clothing size pricing, admin role checking with debug logs

---

## Next Steps:

1. Run `prolyn_wear_clothing_seed.sql` in Supabase SQL Editor
2. Test admin login and check console logs for role verification
3. Verify category chips and product filtering work correctly
4. Test promotional carousel integration

---

## Debug Information:

**Admin Role Check Logs:**
```javascript
console.log('User ID:', user.id);
console.log('isAdmin result:', isAdmin);
console.log('Profile data:', profile);
```

Check browser console when signing in to verify admin role detection.
