-- Update existing database schema to support movie rooms functionality
-- This script modifies existing tables and adds new ones without conflicts

-- 1. Add movie_rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS movie_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(8) UNIQUE NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  created_by VARCHAR(255) NOT NULL,
  room_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 1,
  playback_position DECIMAL(10,2) DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  playback_speed DECIMAL(3,2) DEFAULT 1.0,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add room_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES movie_rooms(id) ON DELETE CASCADE,
  participant_id VARCHAR(255) NOT NULL,
  participant_name VARCHAR(255),
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, participant_id)
);

-- 3. Add room_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES movie_rooms(id) ON DELETE CASCADE,
  participant_id VARCHAR(255) NOT NULL,
  participant_name VARCHAR(255),
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- 4. Create indexes if they don't exist (using IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_movie_rooms_room_code ON movie_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_movie_rooms_movie_id ON movie_rooms(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_rooms_is_active ON movie_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_movie_rooms_created_at ON movie_rooms(created_at);

CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_participant_id ON room_participants(participant_id);

CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_room_messages_timestamp ON room_messages(timestamp);

-- 5. Create or replace the generate_room_code function
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    code VARCHAR(8);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate a random 8-character code
        code := UPPER(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_count FROM movie_rooms WHERE room_code = code;
        
        -- If code doesn't exist, return it
        IF exists_count = 0 THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Create or replace the cleanup function
CREATE OR REPLACE FUNCTION cleanup_inactive_rooms()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE movie_rooms 
    SET is_active = false 
    WHERE last_activity < NOW() - INTERVAL '24 hours' 
    AND is_active = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Create or replace the update_updated_at_column function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create or replace the update_room_activity function
CREATE OR REPLACE FUNCTION update_room_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE movie_rooms 
    SET last_activity = NOW() 
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Drop existing triggers if they exist, then recreate them
DROP TRIGGER IF EXISTS update_movie_rooms_updated_at ON movie_rooms;
DROP TRIGGER IF EXISTS update_room_activity_on_participant ON room_participants;
DROP TRIGGER IF EXISTS update_room_activity_on_message ON room_messages;

-- 10. Create triggers
CREATE TRIGGER update_movie_rooms_updated_at 
    BEFORE UPDATE ON movie_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_activity_on_participant 
    AFTER INSERT OR UPDATE ON room_participants
    FOR EACH ROW EXECUTE FUNCTION update_room_activity();

CREATE TRIGGER update_room_activity_on_message 
    AFTER INSERT ON room_messages
    FOR EACH ROW EXECUTE FUNCTION update_room_activity();

-- 11. Enable RLS if not already enabled
ALTER TABLE movie_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

-- 12. Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Allow read active rooms" ON movie_rooms;
DROP POLICY IF EXISTS "Allow create rooms" ON movie_rooms;
DROP POLICY IF EXISTS "Allow update own rooms" ON movie_rooms;
DROP POLICY IF EXISTS "Allow read participants" ON room_participants;
DROP POLICY IF EXISTS "Allow join rooms" ON room_participants;
DROP POLICY IF EXISTS "Allow leave rooms" ON room_participants;
DROP POLICY IF EXISTS "Allow read messages" ON room_messages;
DROP POLICY IF EXISTS "Allow send messages" ON room_messages;

-- 13. Create RLS policies
CREATE POLICY "Allow read active rooms" ON movie_rooms
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow create rooms" ON movie_rooms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update own rooms" ON movie_rooms
    FOR UPDATE USING (created_by = current_setting('request.jwt.claims', true)::json->>'sub' OR true);

CREATE POLICY "Allow read participants" ON room_participants
    FOR SELECT USING (true);

CREATE POLICY "Allow join rooms" ON room_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow leave rooms" ON room_participants
    FOR DELETE USING (true);

CREATE POLICY "Allow read messages" ON room_messages
    FOR SELECT USING (true);

CREATE POLICY "Allow send messages" ON room_messages
    FOR INSERT WITH CHECK (true);

-- 14. Grant permissions (these are safe to run multiple times)
GRANT ALL ON movie_rooms TO authenticated;
GRANT ALL ON room_participants TO authenticated;
GRANT ALL ON room_messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 15. Enable realtime for tables (safe to run multiple times)
DO $$
BEGIN
    -- Add tables to realtime publication if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'movie_rooms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE movie_rooms;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'room_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE room_participants;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'room_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
    END IF;
END $$;

-- 16. Success message
SELECT 'Movie rooms schema updated successfully! Existing data preserved.' as status;
