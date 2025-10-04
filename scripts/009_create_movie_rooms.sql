-- Create movie rooms table for synchronized viewing
CREATE TABLE IF NOT EXISTS movie_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(8) UNIQUE NOT NULL,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  created_by VARCHAR(255) NOT NULL, -- User identifier (IP, session, etc.)
  room_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 1,
  playback_position DECIMAL(10,2) DEFAULT 0, -- Current playback position in seconds
  is_playing BOOLEAN DEFAULT false,
  playback_speed DECIMAL(3,2) DEFAULT 1.0,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create room participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES movie_rooms(id) ON DELETE CASCADE,
  participant_id VARCHAR(255) NOT NULL, -- User identifier
  participant_name VARCHAR(255),
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, participant_id)
);

-- Create room messages table for chat
CREATE TABLE IF NOT EXISTS room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES movie_rooms(id) ON DELETE CASCADE,
  participant_id VARCHAR(255) NOT NULL,
  participant_name VARCHAR(255),
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movie_rooms_room_code ON movie_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_movie_rooms_movie_id ON movie_rooms(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_rooms_is_active ON movie_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_movie_rooms_created_at ON movie_rooms(created_at);

CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_participant_id ON room_participants(participant_id);

CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_room_messages_timestamp ON room_messages(timestamp);

-- Create function to generate room codes
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

-- Create function to clean up inactive rooms (older than 24 hours)
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

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_movie_rooms_updated_at BEFORE UPDATE ON movie_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update last_activity when room is accessed
CREATE OR REPLACE FUNCTION update_room_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE movie_rooms 
    SET last_activity = NOW() 
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_activity_on_participant 
    AFTER INSERT OR UPDATE ON room_participants
    FOR EACH ROW EXECUTE FUNCTION update_room_activity();

CREATE TRIGGER update_room_activity_on_message 
    AFTER INSERT ON room_messages
    FOR EACH ROW EXECUTE FUNCTION update_room_activity();

-- Create RLS policies
ALTER TABLE movie_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

-- Allow all users to read active rooms
CREATE POLICY "Allow read active rooms" ON movie_rooms
    FOR SELECT USING (is_active = true);

-- Allow users to create rooms
CREATE POLICY "Allow create rooms" ON movie_rooms
    FOR INSERT WITH CHECK (true);

-- Allow room creator to update their room
CREATE POLICY "Allow update own rooms" ON movie_rooms
    FOR UPDATE USING (created_by = current_setting('request.jwt.claims', true)::json->>'sub' OR true);

-- Allow all users to read participants
CREATE POLICY "Allow read participants" ON room_participants
    FOR SELECT USING (true);

-- Allow users to join rooms
CREATE POLICY "Allow join rooms" ON room_participants
    FOR INSERT WITH CHECK (true);

-- Allow users to leave rooms
CREATE POLICY "Allow leave rooms" ON room_participants
    FOR DELETE USING (true);

-- Allow all users to read messages
CREATE POLICY "Allow read messages" ON room_messages
    FOR SELECT USING (true);

-- Allow users to send messages
CREATE POLICY "Allow send messages" ON room_messages
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON movie_rooms TO authenticated;
GRANT ALL ON room_participants TO authenticated;
GRANT ALL ON room_messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
