"use client"

import { useState, useEffect } from "react"

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null) // null = checking, true = first visit, false = returning
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('ag-movies-visited')
    
    if (!hasVisited) {
      setIsFirstVisit(true)
    } else {
      setIsFirstVisit(false)
    }
  }, [])

  // Function to mark as visited (called after redirect)
  const markAsVisited = () => {
    localStorage.setItem('ag-movies-visited', 'true')
    setIsFirstVisit(false)
  }

  return { isFirstVisit, mounted, markAsVisited }
}
