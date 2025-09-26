-- Add support for movie parts and individual episode download links

-- Add part_number column to movies table for multi-part movies
ALTER TABLE public.movies
ADD COLUMN part_number INTEGER DEFAULT 1;

-- Add parent_movie_id column to link movie parts together
ALTER TABLE public.movies
ADD COLUMN parent_movie_id UUID REFERENCES movies(id) ON DELETE CASCADE;

-- Add download_url column to episodes table if not already exists
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS download_url TEXT;

-- Add embed_url column to movies table if not already exists (for individual movie parts)
ALTER TABLE public.movies
ADD COLUMN IF NOT EXISTS embed_url TEXT;

-- Add download_url column to movies table if not already exists
ALTER TABLE public.movies
ADD COLUMN IF NOT EXISTS download_url TEXT;

-- Create index for movie parts
CREATE INDEX IF NOT EXISTS idx_movies_parent_movie_id ON movies(parent_movie_id);
CREATE INDEX IF NOT EXISTS idx_movies_part_number ON movies(part_number);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Allow all operations on movies" ON public.movies;
DROP POLICY IF EXISTS "Allow all operations on episodes" ON public.episodes;

CREATE POLICY "Allow all operations on movies" ON public.movies
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on episodes" ON public.episodes
  FOR ALL USING (true);
