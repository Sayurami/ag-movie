-- PART 2: Add Missing Columns
-- Run this second in Supabase SQL Editor

-- Add missing columns to movies table
DO $$ 
BEGIN
    -- Add download_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'download_url') THEN
        ALTER TABLE movies ADD COLUMN download_url TEXT;
    END IF;
    
    -- Add part_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'part_number') THEN
        ALTER TABLE movies ADD COLUMN part_number INTEGER DEFAULT 1;
    END IF;
    
    -- Add parent_movie_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'parent_movie_id') THEN
        ALTER TABLE movies ADD COLUMN parent_movie_id UUID REFERENCES movies(id) ON DELETE CASCADE;
    END IF;
    
    -- Add narrator if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'narrator') THEN
        ALTER TABLE movies ADD COLUMN narrator TEXT;
    END IF;
END $$;

-- Add missing columns to tv_shows table
DO $$ 
BEGIN
    -- Add download_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tv_shows' AND column_name = 'download_url') THEN
        ALTER TABLE tv_shows ADD COLUMN download_url TEXT;
    END IF;
    
    -- Add narrator if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tv_shows' AND column_name = 'narrator') THEN
        ALTER TABLE tv_shows ADD COLUMN narrator TEXT;
    END IF;
END $$;

-- Add missing columns to episodes table
DO $$ 
BEGIN
    -- Add download_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'episodes' AND column_name = 'download_url') THEN
        ALTER TABLE episodes ADD COLUMN download_url TEXT;
    END IF;
END $$;
