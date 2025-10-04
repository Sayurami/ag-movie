# 🔧 Movie Rooms Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue 1: 500 Internal Server Error when joining room**
**Symptoms:** 
- Error: `POST /api/room-participants 500 (Internal Server Error)`
- Users can't join rooms after entering their name

**Solutions:**
1. **Check Database Tables Exist:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('movie_rooms', 'room_participants', 'room_messages');
   ```

2. **If tables don't exist, run the migration:**
   ```sql
   -- Run scripts/010_update_existing_schema.sql in Supabase SQL Editor
   ```

3. **Check Supabase Connection:**
   - Verify your `.env.local` has correct Supabase credentials
   - Check if Supabase project is active

### **Issue 2: "Content Not Available" Error**
**Symptoms:**
- Room loads but shows "Content Not Available" message
- Video player doesn't appear

**Solutions:**
1. **Check Room Creation:**
   ```sql
   -- Check if room was created with proper movie/episode ID
   SELECT id, room_code, movie_id, episode_id, movies.title, episodes.name
   FROM movie_rooms 
   LEFT JOIN movies ON movie_rooms.movie_id = movies.id
   LEFT JOIN episodes ON movie_rooms.episode_id = episodes.id
   WHERE room_code = 'YOUR_ROOM_CODE';
   ```

2. **Verify Movie/Episode Data:**
   ```sql
   -- Check if the movie exists and has embed_url
   SELECT id, title, embed_url FROM movies WHERE id = 'MOVIE_ID';
   
   -- Or for episodes
   SELECT id, name, embed_url FROM episodes WHERE id = 'EPISODE_ID';
   ```

3. **Check Room Association:**
   - Ensure the room was created with a valid `movie_id` or `episode_id`
   - Verify the movie/episode has a valid `embed_url`

### **Issue 3: Real-time Features Not Working**
**Symptoms:**
- Chat messages don't appear in real-time
- Video sync doesn't work
- Connection status shows "Connecting..."

**Solutions:**
1. **Enable Realtime in Supabase:**
   ```sql
   -- Run in Supabase SQL Editor
   ALTER PUBLICATION supabase_realtime ADD TABLE movie_rooms;
   ALTER PUBLICATION supabase_realtime ADD TABLE room_participants;
   ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
   ```

2. **Check RLS Policies:**
   ```sql
   -- Verify policies exist
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename IN ('movie_rooms', 'room_participants', 'room_messages');
   ```

## 🔍 **Debug Steps**

### **Step 1: Verify Database Setup**
Run this in Supabase SQL Editor:
```sql
-- Check tables exist
SELECT table_name, 'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('movie_rooms', 'room_participants', 'room_messages');

-- Check functions exist
SELECT routine_name, 'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('generate_room_code', 'cleanup_inactive_rooms');
```

### **Step 2: Test Room Creation**
1. Go to a movie page
2. Click "Create Watch Party"
3. Check browser console for any errors
4. Check Supabase logs for API errors

### **Step 3: Test Room Joining**
1. Use the room code from step 2
2. Go to `/room/ROOM_CODE`
3. Enter a name and join
4. Check console for errors

### **Step 4: Check Real-time Connection**
1. Open browser dev tools
2. Go to Network tab
3. Look for WebSocket connections to Supabase
4. Check Console for real-time connection messages

## 🛠️ **Quick Fixes**

### **Reset Database (if needed):**
```sql
-- DROP tables if they exist (WARNING: This deletes all data)
DROP TABLE IF EXISTS room_messages CASCADE;
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS movie_rooms CASCADE;

-- Then run the migration script again
-- scripts/010_update_existing_schema.sql
```

### **Check Environment Variables:**
```bash
# In your .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### **Verify Supabase Project:**
1. Go to your Supabase dashboard
2. Check if project is active
3. Verify API keys are correct
4. Check if realtime is enabled in project settings

## 📞 **Getting Help**

If issues persist:
1. Check browser console for detailed error messages
2. Check Supabase logs in the dashboard
3. Run the database check script: `scripts/check-database.sql`
4. Verify all environment variables are set correctly

## ✅ **Success Indicators**

When everything works correctly:
- ✅ Room creation shows success message with room code
- ✅ Room joining works without errors
- ✅ Video player loads and shows content
- ✅ Chat messages appear in real-time
- ✅ Connection status shows "Live"
- ✅ Host controls work for video playback
