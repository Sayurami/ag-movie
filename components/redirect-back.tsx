"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface RedirectBackProps {
  redirectDelay?: number // Delay in seconds before redirecting back
  redirectUrl?: string // URL to redirect back to (defaults to current page)
}

export function RedirectBack({ redirectDelay = 3, redirectUrl }: RedirectBackProps) {
  const router = useRouter()
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRedirectingRef = useRef(false)

  useEffect(() => {
    // Function to redirect back to the site
    const redirectBack = () => {
      if (isRedirectingRef.current) return
      
      isRedirectingRef.current = true
      const targetUrl = redirectUrl || window.location.href
      
      console.log(`Redirecting back to: ${targetUrl}`)
      
      // Try multiple redirect methods
      try {
        // Method 1: Use Next.js router
        router.push(targetUrl)
      } catch (error) {
        try {
          // Method 2: Use window.location
          window.location.href = targetUrl
        } catch (error2) {
          try {
            // Method 3: Use window.location.replace
            window.location.replace(targetUrl)
          } catch (error3) {
            console.error('All redirect methods failed:', error3)
          }
        }
      }
    }

    // Function to handle visibility change (when user switches tabs/windows)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from the tab
        console.log('User left the tab, setting redirect timer...')
        
        // Clear any existing timeout
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current)
        }
        
        // Set new timeout to redirect back
        redirectTimeoutRef.current = setTimeout(() => {
          redirectBack()
        }, redirectDelay * 1000)
      } else {
        // User came back to the tab
        console.log('User returned to the tab, clearing redirect timer')
        
        // Clear the redirect timeout
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current)
          redirectTimeoutRef.current = null
        }
        
        isRedirectingRef.current = false
      }
    }

    // Function to handle page unload (when user navigates away)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('User is navigating away from the page')
      
      // Set a timeout to redirect back
      setTimeout(() => {
        redirectBack()
      }, redirectDelay * 1000)
      
      // Show a warning message
      event.preventDefault()
      event.returnValue = 'Are you sure you want to leave? You will be redirected back.'
      return 'Are you sure you want to leave? You will be redirected back.'
    }

    // Function to handle focus loss (when user clicks outside the window)
    const handleBlur = () => {
      console.log('Window lost focus, setting redirect timer...')
      
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
      
      redirectTimeoutRef.current = setTimeout(() => {
        redirectBack()
      }, redirectDelay * 1000)
    }

    // Function to handle focus gain (when user returns to window)
    const handleFocus = () => {
      console.log('Window gained focus, clearing redirect timer')
      
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
        redirectTimeoutRef.current = null
      }
      
      isRedirectingRef.current = false
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [router, redirectDelay, redirectUrl])

  // This component doesn't render anything visible
  return null
}
