-- PART 7: Grant Permissions and Seed Data
-- Run this seventh (final) in Supabase SQL Editor

-- Grant permissions
GRANT ALL ON movies TO authenticated;
GRANT ALL ON tv_shows TO authenticated;
GRANT ALL ON seasons TO authenticated;
GRANT ALL ON episodes TO authenticated;
GRANT ALL ON genres TO authenticated;
GRANT ALL ON movie_requests TO authenticated;
GRANT ALL ON movie_rooms TO authenticated;
GRANT ALL ON room_participants TO authenticated;
GRANT ALL ON room_messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Seed basic genres (only if they don't exist)
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
(37, 'Western')
ON CONFLICT (tmdb_id) DO NOTHING;
