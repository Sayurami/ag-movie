# Database Migration Instructions

## Issue: Download buttons not showing

The download buttons are not showing because the `download_url` column doesn't exist in the database yet.

## Solution: Run the SQL Migration

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the following SQL script:**

```sql
-- Add download_url column to movies table
ALTER TABLE public.movies 
ADD COLUMN download_url TEXT;

-- Add download_url column to tv_shows table  
ALTER TABLE public.tv_shows 
ADD COLUMN download_url TEXT;

-- Add download_url column to episodes table
ALTER TABLE public.episodes 
ADD COLUMN download_url TEXT;

-- Update RLS policies to include download_url in operations
DROP POLICY IF EXISTS "Allow all operations on movies" ON public.movies;
DROP POLICY IF EXISTS "Allow all operations on tv shows" ON public.tv_shows;
DROP POLICY IF EXISTS "Allow all operations on episodes" ON public.episodes;

CREATE POLICY "Allow all operations on movies" ON public.movies
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on tv shows" ON public.tv_shows
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on episodes" ON public.episodes
  FOR ALL USING (true);
```

4. **Click "Run" to execute the script**

## Test the Migration

After running the SQL script, you can test if it worked by:

1. **Visit `/api/test-db`** in your browser
2. **Check the response** - it should show `"success": true` and `"message": "download_url column exists"`

## First-Time Visit Issue

The first-time visit detection should work, but you can test it by:

1. **Open browser dev tools** (F12)
2. **Go to Application tab > Local Storage**
3. **Delete the `ag-movies-visited` key** (if it exists)
4. **Refresh the page** - you should be redirected to `/welcome`

## Debug Information

The debug component will show in the top-right corner:
- Mounted status
- First visit status  
- LocalStorage value

Remove the `<DebugFirstVisit />` component from `app/page.tsx` once everything is working.
