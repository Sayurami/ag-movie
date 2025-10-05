-- PART 6: Enable RLS and Create Policies
-- Run this sixth in Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for movies" ON movies;
DROP POLICY IF EXISTS "Public read access for tv shows" ON tv_shows;
DROP POLICY IF EXISTS "Public read access for seasons" ON seasons;
DROP POLICY IF EXISTS "Public read access for episodes" ON episodes;
DROP POLICY IF EXISTS "Public read access for genres" ON genres;
DROP POLICY IF EXISTS "Public read access for movie requests" ON movie_requests;
DROP POLICY IF EXISTS "Allow read active rooms" ON movie_rooms;
DROP POLICY IF EXISTS "Allow create rooms" ON movie_rooms;
DROP POLICY IF EXISTS "Allow update own rooms" ON movie_rooms;
DROP POLICY IF EXISTS "Allow read participants" ON room_participants;
DROP POLICY IF EXISTS "Allow join rooms" ON room_participants;
DROP POLICY IF EXISTS "Allow leave rooms" ON room_participants;
DROP POLICY IF EXISTS "Allow read messages" ON room_messages;
DROP POLICY IF EXISTS "Allow send messages" ON room_messages;
DROP POLICY IF EXISTS "Service role can manage movies" ON movies;
DROP POLICY IF EXISTS "Service role can manage tv shows" ON tv_shows;
DROP POLICY IF EXISTS "Service role can manage seasons" ON seasons;
DROP POLICY IF EXISTS "Service role can manage episodes" ON episodes;
DROP POLICY IF EXISTS "Service role can manage genres" ON genres;
DROP POLICY IF EXISTS "Service role can manage movie requests" ON movie_requests;
DROP POLICY IF EXISTS "Service role can manage movie rooms" ON movie_rooms;
DROP POLICY IF EXISTS "Service role can manage room participants" ON room_participants;
DROP POLICY IF EXISTS "Service role can manage room messages" ON room_messages;

-- Create public read access policies
CREATE POLICY "Public read access for movies" ON movies FOR SELECT USING (true);
CREATE POLICY "Public read access for tv shows" ON tv_shows FOR SELECT USING (true);
CREATE POLICY "Public read access for seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read access for episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public read access for genres" ON genres FOR SELECT USING (true);
CREATE POLICY "Public read access for movie requests" ON movie_requests FOR SELECT USING (true);

-- Create movie rooms policies
CREATE POLICY "Allow read active rooms" ON movie_rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Allow create rooms" ON movie_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update own rooms" ON movie_rooms FOR UPDATE USING (true);

-- Create room participants policies
CREATE POLICY "Allow read participants" ON room_participants FOR SELECT USING (true);
CREATE POLICY "Allow join rooms" ON room_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow leave rooms" ON room_participants FOR DELETE USING (true);

-- Create room messages policies
CREATE POLICY "Allow read messages" ON room_messages FOR SELECT USING (true);
CREATE POLICY "Allow send messages" ON room_messages FOR INSERT WITH CHECK (true);

-- Create admin policies (for service role)
CREATE POLICY "Service role can manage movies" ON movies FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage tv shows" ON tv_shows FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage seasons" ON seasons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage episodes" ON episodes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage genres" ON genres FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage movie requests" ON movie_requests FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage movie rooms" ON movie_rooms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage room participants" ON room_participants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage room messages" ON room_messages FOR ALL USING (auth.role() = 'service_role');
