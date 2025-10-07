"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface RedirectBackProps {
  redirectDelay?: number // Delay in seconds before redirecting back
  redirectUrl?: string // URL to redirect back to (defaults to current page)
}

export function RedirectBack({ redirectDelay = 3, redirectUrl }: RedirectBackProps) {
  // Component disabled to prevent annoying redirects
  return null
}
