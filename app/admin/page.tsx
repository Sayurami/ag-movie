import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MovieManager } from "@/components/admin/movie-manager"
import { TVShowManager } from "@/components/admin/tv-show-manager"
import { ComingSoonManager } from "@/components/admin/coming-soon-manager"
import { ContentStats } from "@/components/admin/content-stats"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AG MOVIES Admin</h1>
          <p className="text-muted-foreground">Manage your streaming content</p>
        </div>

        <ContentStats />

        <Tabs defaultValue="movies" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="tv-shows">TV Shows</TabsTrigger>
            <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Movie Management</CardTitle>
                <CardDescription>Add and manage movies using TMDB integration</CardDescription>
              </CardHeader>
              <CardContent>
                <MovieManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tv-shows" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>TV Show Management</CardTitle>
                <CardDescription>Add and manage TV shows with episodes</CardDescription>
              </CardHeader>
              <CardContent>
                <TVShowManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coming-soon" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>Schedule upcoming releases</CardDescription>
              </CardHeader>
              <CardContent>
                <ComingSoonManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
