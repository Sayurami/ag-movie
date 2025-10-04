import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { MovieRoom } from "@/components/movie-room"
import { createClient } from "@/lib/supabase/server"

interface RoomPageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { code } = await params
  
  return {
    title: `Room ${code} - AG Movies Watch Party`,
    description: 'Join a synchronized movie watching experience with friends.',
  }
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { code } = await params
  const supabase = await createClient()

  // Fetch room data
  const { data: room, error } = await supabase
    .from('movie_rooms')
    .select(`
      *,
      movies (id, title, poster_path, backdrop_path, embed_url, overview, release_date, runtime, vote_average),
      episodes (id, name, embed_url, tv_shows (id, name))
    `)
    .eq('room_code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !room) {
    console.error('Room fetch error:', error)
    console.error('Room code searched:', code.toUpperCase())
    notFound()
  }

  console.log('Room data fetched:', {
    id: room.id,
    room_code: room.room_code,
    movie_id: room.movie_id,
    episode_id: room.episode_id,
    has_movie: !!room.movies,
    has_episode: !!room.episodes,
    movie_title: room.movies?.title,
    episode_name: room.episodes?.name
  })

  // Ensure room has the necessary data
  if (!room.movies && !room.episodes) {
    console.error('Room has no associated content')
    console.error('Room movie_id:', room.movie_id)
    console.error('Room episode_id:', room.episode_id)
    notFound()
  }

  // Get participants
  const { data: participants } = await supabase
    .from('room_participants')
    .select('*')
    .eq('room_id', room.id)
    .order('joined_at', { ascending: true })

  // Get recent messages
  const { data: messages } = await supabase
    .from('room_messages')
    .select('*')
    .eq('room_id', room.id)
    .order('timestamp', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        <MovieRoom 
          room={room}
          participants={participants || []}
          messages={messages || []}
        />
      </main>

      <Footer />
    </div>
  )
}
