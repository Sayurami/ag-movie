-- Simple database check - run this first to verify basic setup
-- This is a minimal check that won't interfere with existing data

-- 1. Check if movie_rooms table exists and has data
SELECT 'movie_rooms table check:' as info;
SELECT COUNT(*) as room_count FROM movie_rooms;

-- 2. Check if room_participants table exists
SELECT 'room_participants table check:' as info;
SELECT COUNT(*) as participant_count FROM room_participants;

-- 3. Check if room_messages table exists  
SELECT 'room_messages table check:' as info;
SELECT COUNT(*) as message_count FROM room_messages;

-- 4. Show recent rooms with their associated content
SELECT 'Recent rooms with content:' as info;
SELECT 
    mr.id,
    mr.room_code,
    mr.movie_id,
    mr.episode_id,
    mr.created_at,
    m.title as movie_title,
    m.embed_url as movie_embed_url,
    e.name as episode_name,
    e.embed_url as episode_embed_url
FROM movie_rooms mr
LEFT JOIN movies m ON mr.movie_id = m.id
LEFT JOIN episodes e ON mr.episode_id = e.id
ORDER BY mr.created_at DESC
LIMIT 5;

-- 5. Check if any rooms have missing content
SELECT 'Rooms with missing content:' as info;
SELECT 
    mr.id,
    mr.room_code,
    mr.movie_id,
    mr.episode_id,
    CASE 
        WHEN mr.movie_id IS NOT NULL AND m.id IS NULL THEN 'Missing movie'
        WHEN mr.episode_id IS NOT NULL AND e.id IS NULL THEN 'Missing episode'
        WHEN mr.movie_id IS NULL AND mr.episode_id IS NULL THEN 'No content assigned'
        ELSE 'Content exists'
    END as content_status
FROM movie_rooms mr
LEFT JOIN movies m ON mr.movie_id = m.id
LEFT JOIN episodes e ON mr.episode_id = e.id
WHERE (mr.movie_id IS NOT NULL AND m.id IS NULL) 
   OR (mr.episode_id IS NOT NULL AND e.id IS NULL)
   OR (mr.movie_id IS NULL AND mr.episode_id IS NULL);
