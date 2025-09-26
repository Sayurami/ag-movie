"use client"

import { useFirstVisit } from "@/hooks/use-first-visit"

export function DebugFirstVisit() {
  const { isFirstVisit, mounted, markAsVisited } = useFirstVisit()

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-md text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">Debug First Visit</h3>
      <p>Mounted: {mounted ? "true" : "false"}</p>
      <p>Is First Visit: {isFirstVisit === null ? "null" : isFirstVisit ? "true" : "false"}</p>
      <p>LocalStorage: {typeof window !== 'undefined' ? localStorage.getItem('ag-movies-visited') || 'null' : 'N/A'}</p>
      <button 
        onClick={() => {
          localStorage.removeItem('ag-movies-visited')
          window.location.reload()
        }}
        className="mt-2 px-2 py-1 bg-white text-red-500 rounded text-xs"
      >
        Clear & Reload
      </button>
      <button 
        onClick={markAsVisited}
        className="mt-1 px-2 py-1 bg-white text-red-500 rounded text-xs block"
      >
        Mark as Visited
      </button>
    </div>
  )
}
