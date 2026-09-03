# Fix Supabase Connection Issue

## Problem
The app is showing clothing mockup data instead of medicine products from Supabase because:
1. The deployed Vercel build has stale environment variables
2. The Supabase products table is empty or hasn't been seeded with medicine data

## Solution

### Step 1: Seed Medicine Products in Supabase
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/qqoocftiftpalvzdggtl/sql
2. Run the file: `seed_pharmacy_data.sql`
3. Verify data was inserted by running:
   ```sql
   SELECT name, form, dosage_strength, price FROM products;
   ```

### Step 2: Update Vercel Environment Variables
1. Go to Vercel Dashboard: https://vercel.com/your-project/settings/environment-variables
2. Verify these variables are set:
   - `EXPO_PUBLIC_SUPABASE_URL` = `https://qqoocftiftpalvzdggtl.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
3. If they're missing or wrong, add/update them
4. **Important**: Select all environments (Production, Preview, Development)

### Step 3: Rebuild and Redeploy
Option A - Trigger redeploy in Vercel:
1. Go to your Vercel project
2. Go to Deployments tab
3. Click "..." menu on latest deployment
4. Click "Redeploy"

Option B - Push a new commit:
```powershell
git add .
git commit -m "Fix Supabase connection for pharmacy products"
git push
```

### Step 4: Clear Browser Cache
After redeployment:
1. Open your site: https://green-health-clinic.vercel.app
2. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Or clear browser cache completely

## Verification
Once deployed, you should see:
- ✅ Medicine products instead of clothing
- ✅ Fields like "Tablet", "500mg", "Paracetamol"
- ✅ No console errors about "Invalid path specified in request URL"
- ✅ No fallback demo products

## Debugging
If still showing mockup data, check console logs:
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for:
   - "✅ Products fetched from Supabase: X products" (should be > 0)
   - Any errors mentioning Supabase

## Current Status
- ✅ .env file is correct locally
- ✅ lib/supabase.js configuration is correct
- ✅ SQL seed script is ready (seed_pharmacy_data.sql)
- ⏳ Needs: Run SQL script in Supabase
- ⏳ Needs: Redeploy to Vercel with fresh env vars
