-- PART 4: Create Indexes
-- Run this fourth in Supabase SQL Editor

-- Movies indexes
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_status ON movies(status);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);
CREATE INDEX IF NOT EXISTS idx_movies_scheduled_release ON movies(scheduled_release);
CREATE INDEX IF NOT EXISTS idx_movies_parent_movie_id ON movies(parent_movie_id);
CREATE INDEX IF NOT EXISTS idx_movies_part_number ON movies(part_number);

-- TV Shows indexes
CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_id ON tv_shows(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_tv_shows_status ON tv_shows(status);
CREATE INDEX IF NOT EXISTS idx_tv_shows_first_air_date ON tv_shows(first_air_date);

-- Episodes indexes
CREATE INDEX IF NOT EXISTS idx_episodes_tv_show_id ON episodes(tv_show_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_id ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_episode ON episodes(season_number, episode_number);

-- Movie rooms indexes
CREATE INDEX IF NOT EXISTS idx_movie_rooms_room_code ON movie_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_movie_rooms_movie_id ON movie_rooms(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_rooms_is_active ON movie_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_movie_rooms_created_at ON movie_rooms(created_at);

-- Room participants indexes
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_participant_id ON room_participants(participant_id);

-- Room messages indexes
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_room_messages_timestamp ON room_messages(timestamp);
