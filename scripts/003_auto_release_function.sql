-- Create function to automatically release scheduled content
CREATE OR REPLACE FUNCTION auto_release_scheduled_content()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update movies that are scheduled to be released
  UPDATE movies 
  SET status = 'active'
  WHERE status = 'coming_soon' 
    AND scheduled_release IS NOT NULL 
    AND scheduled_release <= NOW();

  -- Update TV shows that are scheduled to be released
  UPDATE tv_shows 
  SET status = 'active'
  WHERE status = 'coming_soon' 
    AND scheduled_release IS NOT NULL 
    AND scheduled_release <= NOW();

  -- Log the number of items released (optional)
  RAISE NOTICE 'Auto-release function executed at %', NOW();
END;
$$;

-- Create a trigger to run the auto-release function periodically
-- Note: This would typically be set up as a cron job or scheduled task
-- For demonstration, we'll create a function that can be called manually

-- Example usage: SELECT auto_release_scheduled_content();
