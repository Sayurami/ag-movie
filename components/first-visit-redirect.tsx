"use client"

import { useFirstVisit } from "@/hooks/use-first-visit"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface FirstVisitRedirectProps {
  children: React.ReactNode
}

export function FirstVisitRedirect({ children }: FirstVisitRedirectProps) {
  const { isFirstVisit, mounted, markAsVisited } = useFirstVisit()
  const router = useRouter()

  useEffect(() => {
    if (mounted && isFirstVisit === true) {
      // Redirect immediately without marking as visited first
      router.push('/welcome')
    }
  }, [mounted, isFirstVisit, router])

  // Show loading while checking or not mounted
  if (!mounted || isFirstVisit === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show redirecting message for first visit
  if (isFirstVisit === true) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to welcome page...</p>
        </div>
      </div>
    )
  }

  // Show normal content for returning visitors
  return <>{children}</>
}
