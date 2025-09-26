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
-- (The existing policies should already cover all columns, but let's be explicit)
DROP POLICY IF EXISTS "Allow all operations on movies" ON public.movies;
DROP POLICY IF EXISTS "Allow all operations on tv shows" ON public.tv_shows;
DROP POLICY IF EXISTS "Allow all operations on episodes" ON public.episodes;

CREATE POLICY "Allow all operations on movies" ON public.movies
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on tv shows" ON public.tv_shows
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on episodes" ON public.episodes
  FOR ALL USING (true);
