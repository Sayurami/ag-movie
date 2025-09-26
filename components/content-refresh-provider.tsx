"use client"

import { useContentRefresh } from "@/hooks/use-content-refresh"

export function ContentRefreshProvider() {
  useContentRefresh()
  return null
}
