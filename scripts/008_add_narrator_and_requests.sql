-- Add narrator column to movies table
ALTER TABLE movies ADD COLUMN IF NOT EXISTS narrator TEXT;

-- Add narrator column to tv_shows table  
ALTER TABLE tv_shows ADD COLUMN IF NOT EXISTS narrator TEXT;

-- Create movie_requests table
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

-- Create indexes for movie_requests table
CREATE INDEX IF NOT EXISTS idx_movie_requests_status ON movie_requests(status);
CREATE INDEX IF NOT EXISTS idx_movie_requests_type ON movie_requests(type);
CREATE INDEX IF NOT EXISTS idx_movie_requests_created_at ON movie_requests(created_at);

-- Create function to update updated_at timestamp for movie_requests
CREATE OR REPLACE FUNCTION update_movie_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for movie_requests updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_movie_requests_updated_at ON movie_requests;
CREATE TRIGGER update_movie_requests_updated_at BEFORE UPDATE ON movie_requests
    FOR EACH ROW EXECUTE FUNCTION update_movie_requests_updated_at();

-- Add RLS policies for movie_requests table
ALTER TABLE movie_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to insert movie requests" ON movie_requests;
DROP POLICY IF EXISTS "Allow public to view all requests" ON movie_requests;
DROP POLICY IF EXISTS "Allow public to update requests" ON movie_requests;
DROP POLICY IF EXISTS "Allow public to delete requests" ON movie_requests;

-- Allow public to insert movie requests
CREATE POLICY "Allow public to insert movie requests" ON movie_requests
    FOR INSERT WITH CHECK (true);

-- Allow public to view all requests (for admin access)
CREATE POLICY "Allow public to view all requests" ON movie_requests
    FOR SELECT USING (true);

-- Allow public to update requests (for admin access)
CREATE POLICY "Allow public to update requests" ON movie_requests
    FOR UPDATE USING (true);

-- Allow public to delete requests (for admin access)
CREATE POLICY "Allow public to delete requests" ON movie_requests
    FOR DELETE USING (true);
