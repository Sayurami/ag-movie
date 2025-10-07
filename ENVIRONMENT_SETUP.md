# Environment Variables Setup Guide

## Required Environment Variables

To fix the server-side error you're experiencing, you need to set up the following environment variables in your production environment:

### 1. Supabase Configuration

```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anonymous Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Optional Environment Variables

```bash
# Cron Secret for auto-release functionality
CRON_SECRET=your-secret-key-here
```

## How to Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

## Setting Up Environment Variables

### For Vercel (Recommended)

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `CRON_SECRET` = your secret key (optional)

### For Other Hosting Platforms

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CRON_SECRET=your-secret-key-here
```

## Database Setup

Make sure your Supabase database has the required tables. Run these SQL commands in your Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('movies', 'tv_shows', 'genres', 'movie_rooms', 'room_participants', 'room_messages');

-- If tables don't exist, run the migration scripts from the scripts/ folder
```

## Testing the Setup

After setting up the environment variables:

1. Redeploy your application
2. Try accessing a movie page
3. Check the browser console for any errors
4. Check your hosting platform's logs for server-side errors

## Common Issues and Solutions

### Issue: "Supabase configuration is missing"
**Solution**: Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly.

### Issue: "Database connection error"
**Solution**: Verify your Supabase project is active and the credentials are correct.

### Issue: "Table doesn't exist"
**Solution**: Run the database migration scripts from the `scripts/` folder in your Supabase SQL Editor.

## Security Notes

- Never commit `.env.local` files to version control
- Use environment variables for all sensitive configuration
- The `NEXT_PUBLIC_` prefix makes variables available to the client-side code
- Use server-side environment variables (without `NEXT_PUBLIC_`) for sensitive server-only data

