-- Enable Row Level Security on all tables for basic security
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- Simple public read access policies (no user authentication required)
CREATE POLICY "Public read access for movies" ON public.movies
  FOR SELECT USING (true);

CREATE POLICY "Public read access for tv shows" ON public.tv_shows
  FOR SELECT USING (true);

CREATE POLICY "Public read access for seasons" ON public.seasons
  FOR SELECT USING (true);

CREATE POLICY "Public read access for episodes" ON public.episodes
  FOR SELECT USING (true);

CREATE POLICY "Public read access for genres" ON public.genres
  FOR SELECT USING (true);

-- Admin insert/update/delete policies (for admin functionality)
-- These will work with service role key for admin operations
CREATE POLICY "Service role can manage movies" ON public.movies
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage tv shows" ON public.tv_shows
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage seasons" ON public.seasons
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage episodes" ON public.episodes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage genres" ON public.genres
  FOR ALL USING (auth.role() = 'service_role');
