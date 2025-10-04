-- Check if movie room tables exist and show their structure
-- Run this in Supabase SQL Editor to verify the database setup

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('movie_rooms', 'room_participants', 'room_messages') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('movie_rooms', 'room_participants', 'room_messages')
ORDER BY table_name;

-- Show table structures if they exist
DO $$
BEGIN
    -- Check movie_rooms table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movie_rooms') THEN
        RAISE NOTICE 'movie_rooms table exists';
        PERFORM * FROM movie_rooms LIMIT 0;
    ELSE
        RAISE NOTICE 'movie_rooms table does NOT exist';
    END IF;

    -- Check room_participants table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_participants') THEN
        RAISE NOTICE 'room_participants table exists';
        PERFORM * FROM room_participants LIMIT 0;
    ELSE
        RAISE NOTICE 'room_participants table does NOT exist';
    END IF;

    -- Check room_messages table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_messages') THEN
        RAISE NOTICE 'room_messages table exists';
        PERFORM * FROM room_messages LIMIT 0;
    ELSE
        RAISE NOTICE 'room_messages table does NOT exist';
    END IF;
END $$;

-- Check if functions exist
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IN ('generate_room_code', 'cleanup_inactive_rooms', 'update_updated_at_column', 'update_room_activity') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('generate_room_code', 'cleanup_inactive_rooms', 'update_updated_at_column', 'update_room_activity')
ORDER BY routine_name;

-- Check if realtime is enabled
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND tablename = t.tablename
        ) THEN '✅ ENABLED'
        ELSE '❌ NOT ENABLED'
    END as realtime_status
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('movie_rooms', 'room_participants', 'room_messages')
ORDER BY table_name;

-- Show current movie_rooms data if any
SELECT 'Current movie_rooms data:' as info;
SELECT id, room_code, movie_id, episode_id, created_by, is_active, created_at 
FROM movie_rooms 
ORDER BY created_at DESC 
LIMIT 5;
