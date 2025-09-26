"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import type { Genre } from "@/lib/types"
import { Filter, X } from "lucide-react"

interface FilterSidebarProps {
  genres: Genre[]
  type: "movies" | "tv-shows"
}

export function FilterSidebar({ genres, type }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentGenre = searchParams.get("genre")
  const currentSort = searchParams.get("sort") || "newest"
  const currentYear = searchParams.get("year")
  const currentRating = searchParams.get("rating") || "0"

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/${type}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(`/${type}`)
  }

  const hasActiveFilters = currentGenre || currentYear || Number.parseFloat(currentRating) > 0

  const currentYearInt = currentYear ? Number.parseInt(currentYear) : new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          Filters {hasActiveFilters && <Badge className="ml-2">Active</Badge>}
        </Button>
      </div>

      {/* Filter Sidebar */}
      <div className={`lg:block ${isOpen ? "block" : "hidden"} w-full lg:w-64 space-y-6`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filters</span>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sort */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
              <Select value={currentSort} onValueChange={(value) => updateFilter("sort", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Genre */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Genre</label>
              <Select value={currentGenre || "all"} onValueChange={(value) => updateFilter("genre", value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="All genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.name}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Release Year</label>
              <Select value={currentYear || "any"} onValueChange={(value) => updateFilter("year", value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any year</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Minimum Rating: {currentRating}/10
              </label>
              <Slider
                value={[Number.parseFloat(currentRating)]}
                onValueChange={([value]) => updateFilter("rating", value > 0 ? value.toString() : null)}
                max={10}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
