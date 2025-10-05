-- PART 5: Create Functions and Triggers
-- Run this fifth in Supabase SQL Editor

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    code VARCHAR(8);
    exists_count INTEGER;
BEGIN
    LOOP
        code := UPPER(substring(md5(random()::text) from 1 for 8));
        SELECT COUNT(*) INTO exists_count FROM movie_rooms WHERE room_code = code;
        IF exists_count = 0 THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up inactive rooms
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

-- Function to update room activity
CREATE OR REPLACE FUNCTION update_room_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE movie_rooms 
    SET last_activity = NOW() 
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_movies_updated_at ON movies;
DROP TRIGGER IF EXISTS update_tv_shows_updated_at ON tv_shows;
DROP TRIGGER IF EXISTS update_movie_rooms_updated_at ON movie_rooms;
DROP TRIGGER IF EXISTS update_room_activity_on_participant ON room_participants;
DROP TRIGGER IF EXISTS update_room_activity_on_message ON room_messages;

-- Create triggers for updated_at
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tv_shows_updated_at BEFORE UPDATE ON tv_shows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movie_rooms_updated_at BEFORE UPDATE ON movie_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for room activity
CREATE TRIGGER update_room_activity_on_participant 
    AFTER INSERT OR UPDATE ON room_participants
    FOR EACH ROW EXECUTE FUNCTION update_room_activity();

CREATE TRIGGER update_room_activity_on_message 
    AFTER INSERT ON room_messages
    FOR EACH ROW EXECUTE FUNCTION update_room_activity();
