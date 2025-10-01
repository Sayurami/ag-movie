import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SearchResults } from "@/components/search-results"
import { SearchBar } from "@/components/search-bar"
import { createClient } from "@/lib/supabase/server"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    type?: "all" | "movies" | "tv-shows"
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ""
  const type = params.type || "all"

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
              <p className="text-muted-foreground mb-6">Find movies and TV shows</p>
              <SearchBar />
            </div>
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-foreground mb-2">Start Your Search</h3>
              <p className="text-muted-foreground">Enter a movie or TV show title to get started</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const supabase = await createClient()

  // Search movies and TV shows
  const searchPromises = []

  if (type === "all" || type === "movies") {
    searchPromises.push(
      supabase
        .from("movies")
        .select("*")
        .eq("status", "active")
        .or("part_number.is.null,part_number.eq.1") // Only show standalone movies or Part 1
        .ilike("title", `%${query}%`)
        .limit(20),
    )
  } else {
    searchPromises.push(Promise.resolve({ data: [] }))
  }

  if (type === "all" || type === "tv-shows") {
    searchPromises.push(
      supabase.from("tv_shows").select("*").eq("status", "active").ilike("name", `%${query}%`).limit(20),
    )
  } else {
    searchPromises.push(Promise.resolve({ data: [] }))
  }

  const [{ data: movies }, { data: tvShows }] = await Promise.all(searchPromises)

  const totalResults = (movies?.length || 0) + (tvShows?.length || 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
            <p className="text-muted-foreground mb-6">Find movies and TV shows</p>
            <SearchBar initialQuery={query} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Search Results</h2>
            <p className="text-muted-foreground">
              {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
            </p>
          </div>

          <SearchResults movies={movies || []} tvShows={tvShows || []} query={query} type={type} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
