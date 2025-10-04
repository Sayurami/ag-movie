-- Complete database setup script
-- Run this script in your Supabase SQL editor to set up the database

-- 1. Create the schema (from 001_create_movies_schema.sql)
-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date DATE,
  runtime INTEGER,
  vote_average DECIMAL(3,1),
  vote_count INTEGER,
  genres JSONB DEFAULT '[]',
  trailer_url TEXT,
  embed_url TEXT NOT NULL,
  download_url TEXT,
  part_number INTEGER,
  parent_movie_id UUID REFERENCES movies(id),
  narrator TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'coming_soon')),
  scheduled_release TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create TV shows table
CREATE TABLE IF NOT EXISTS tv_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  first_air_date DATE,
  last_air_date DATE,
  number_of_seasons INTEGER,
  number_of_episodes INTEGER,
  vote_average DECIMAL(3,1),
  vote_count INTEGER,
  genres JSONB DEFAULT '[]',
  trailer_url TEXT,
  download_url TEXT,
  narrator TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'coming_soon')),
  scheduled_release TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tv_show_id UUID REFERENCES tv_shows(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  season_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  air_date DATE,
  episode_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tv_show_id, season_number)
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  tv_show_id UUID REFERENCES tv_shows(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  season_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  overview TEXT,
  still_path TEXT,
  air_date DATE,
  runtime INTEGER,
  vote_average DECIMAL(3,1),
  vote_count INTEGER,
  embed_url TEXT NOT NULL,
  download_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(season_id, episode_number)
);

-- Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create movie requests table
CREATE TABLE IF NOT EXISTS movie_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'tv_show')),
  year INTEGER,
  description TEXT,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_status ON movies(status);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);
CREATE INDEX IF NOT EXISTS idx_movies_scheduled_release ON movies(scheduled_release);

CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_id ON tv_shows(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_tv_shows_status ON tv_shows(status);
CREATE INDEX IF NOT EXISTS idx_tv_shows_first_air_date ON tv_shows(first_air_date);

CREATE INDEX IF NOT EXISTS idx_episodes_tv_show_id ON episodes(tv_show_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_id ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_episode ON episodes(season_number, episode_number);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tv_shows_updated_at BEFORE UPDATE ON tv_shows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movie_requests_updated_at BEFORE UPDATE ON movie_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Seed genres (from 002_seed_genres.sql)
INSERT INTO genres (tmdb_id, name) VALUES
(28, 'Action'),
(12, 'Adventure'),
(16, 'Animation'),
(35, 'Comedy'),
(80, 'Crime'),
(99, 'Documentary'),
(18, 'Drama'),
(10751, 'Family'),
(14, 'Fantasy'),
(36, 'History'),
(27, 'Horror'),
(10402, 'Music'),
(9648, 'Mystery'),
(10749, 'Romance'),
(878, 'Science Fiction'),
(10770, 'TV Movie'),
(53, 'Thriller'),
(10752, 'War'),
(37, 'Western'),
(10759, 'Action & Adventure'),
(10762, 'Kids'),
(10763, 'News'),
(10764, 'Reality'),
(10765, 'Sci-Fi & Fantasy'),
(10766, 'Soap'),
(10767, 'Talk'),
(10768, 'War & Politics')
ON CONFLICT (tmdb_id) DO NOTHING;

-- 3. Seed sample data (from 004_seed_sample_data.sql)
INSERT INTO public.movies (tmdb_id, title, overview, poster_path, backdrop_path, release_date, runtime, vote_average, vote_count, genres, trailer_url, embed_url, status) VALUES
(603, 'The Matrix', 'Set in the 22nd century, The Matrix tells the story of a computer programmer who is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.', '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg', '1999-03-30', 136, 8.2, 24821, '[{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}]', 'https://www.youtube.com/watch?v=vKQi3bBA1y8', 'https://vidsrc.xyz/embed/movie/603', 'active'),
(27205, 'Inception', 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person''s idea into a target''s subconscious.', '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', '2010-07-15', 148, 8.4, 35021, '[{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}, {"id": 12, "name": "Adventure"}]', 'https://www.youtube.com/watch?v=YoHD9XEInc0', 'https://vidsrc.xyz/embed/movie/27205', 'active'),
(155, 'The Dark Knight', 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.', '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', '/qlGoGQSVMzIjGbpvXzZUOH1FjNu.jpg', '2008-07-16', 152, 9.0, 32106, '[{"id": 18, "name": "Drama"}, {"id": 28, "name": "Action"}, {"id": 80, "name": "Crime"}, {"id": 53, "name": "Thriller"}]', 'https://www.youtube.com/watch?v=EXeTwQWrcwY', 'https://vidsrc.xyz/embed/movie/155', 'active'),
(680, 'Pulp Fiction', 'A burger-loving hit man, his philosophical partner, a drug-addled gangster''s moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.', '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', '/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg', '1994-09-10', 154, 8.5, 27398, '[{"id": 53, "name": "Thriller"}, {"id": 80, "name": "Crime"}]', 'https://www.youtube.com/watch?v=s7EdQ4FqbhY', 'https://vidsrc.xyz/embed/movie/680', 'active'),
(157336, 'Interstellar', 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.', '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', '/pbrkL804c8yAv3zBZR4QPWZpbQ4.jpg', '2014-11-05', 169, 8.4, 34077, '[{"id": 12, "name": "Adventure"}, {"id": 18, "name": "Drama"}, {"id": 878, "name": "Science Fiction"}]', 'https://www.youtube.com/watch?v=zSWdZVtXT7E', 'https://vidsrc.xyz/embed/movie/157336', 'active')
ON CONFLICT (tmdb_id) DO NOTHING;

-- Insert sample TV shows
INSERT INTO public.tv_shows (tmdb_id, name, overview, poster_path, backdrop_path, first_air_date, number_of_seasons, number_of_episodes, vote_average, vote_count, genres, trailer_url, status) VALUES
(1396, 'Breaking Bad', 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family''s financial future at any cost as he enters the dangerous world of drugs and crime.', '/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg', '/tsRy63Mu5cu8etL1X20ZLSudYH9.jpg', '2008-01-20', 5, 62, 9.0, 13049, '[{"id": 80, "name": "Crime"}, {"id": 18, "name": "Drama"}, {"id": 53, "name": "Thriller"}]', 'https://www.youtube.com/watch?v=HhesaQXLuRY', 'active'),
(1399, 'Game of Thrones', 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night''s Watch, is all that stands between the realms of men and icy horrors beyond.', '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg', '2011-04-17', 8, 73, 8.4, 22548, '[{"id": 10765, "name": "Sci-Fi & Fantasy"}, {"id": 18, "name": "Drama"}, {"id": 10759, "name": "Action & Adventure"}]', 'https://www.youtube.com/watch?v=rlR4PJn8b8I', 'active')
ON CONFLICT (tmdb_id) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as status;
