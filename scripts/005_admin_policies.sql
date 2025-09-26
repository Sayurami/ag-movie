-- Update RLS policies to allow admin operations with anon key
-- This is for client-side admin interface

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Service role can manage movies" ON public.movies;
DROP POLICY IF EXISTS "Service role can manage tv shows" ON public.tv_shows;
DROP POLICY IF EXISTS "Service role can manage seasons" ON public.seasons;
DROP POLICY IF EXISTS "Service role can manage episodes" ON public.episodes;
DROP POLICY IF EXISTS "Service role can manage genres" ON public.genres;

-- Create new policies that allow all operations with anon key
-- This is suitable for a simple admin interface without user authentication
CREATE POLICY "Allow all operations on movies" ON public.movies
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on tv shows" ON public.tv_shows
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on seasons" ON public.seasons
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on episodes" ON public.episodes
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on genres" ON public.genres
  FOR ALL USING (true);
