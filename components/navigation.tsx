"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SearchModal } from "@/components/search-modal"
import { PWAInstallGuide } from "@/components/pwa-install-guide"
import { Search, Home, Clock, Bookmark, Grid3X3, Download, Film, Tv } from "lucide-react"

export function Navigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstalled(true)
      }
    }
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/tv-shows", label: "TV Shows" },
    { href: "/categories", label: "Categories" },
    { href: "/coming-soon", label: "Coming Soon" },
    { href: "/watchlist", label: "My List" },
  ]

  const mobileNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/tv-shows", label: "Shows", icon: Tv },
    { href: "/coming-soon", label: "Coming", icon: Clock },
    { href: "/watchlist", label: "My List", icon: Bookmark },
  ]

  // Add install button to mobile nav if not installed
  const allMobileNavItems = isInstalled 
    ? mobileNavItems 
    : [...mobileNavItems, { href: "#", label: "Install", icon: Download, isInstall: true }]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">AG</span>
              </div>
              <span className="text-xl font-bold text-foreground">MOVIES</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Search and Install */}
            <div className="flex items-center space-x-4">
              <PWAInstallGuide />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-start overflow-x-auto py-3 px-2 space-x-1">
          {allMobileNavItems.map((item) => {
            const IconComponent = item.icon
            const isActive = pathname === item.href
            const isInstallButton = item.isInstall
            
            if (isInstallButton) {
              return (
                <button
                  key="install"
                  onClick={handleInstallClick}
                  className="flex flex-col items-center justify-center py-2 px-3 text-muted-foreground hover:text-foreground transition-colors min-w-[60px]"
                >
                  <IconComponent className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">Install</span>
                </button>
              )
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-3 transition-colors min-w-[60px] ${
                  isActive 
                    ? 'text-blue-500' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconComponent className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Floating Categories Button for Mobile */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button
          asChild
          size="sm"
          className="bg-background/80 backdrop-blur-md border border-border hover:bg-background/90 shadow-lg"
        >
          <Link href="/categories" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="text-sm font-medium">Categories</span>
          </Link>
        </Button>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
