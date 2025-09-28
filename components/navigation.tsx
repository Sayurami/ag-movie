"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchModal } from "@/components/search-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Search, Menu, X, ChevronDown } from "lucide-react"

export function Navigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/tv-shows", label: "TV Shows" },
    { href: "/categories", label: "Categories" },
    { href: "/coming-soon", label: "Coming Soon" },
    { href: "/watchlist", label: "My List" },
  ]

  const moreItems = [
    { href: "/about", label: "About Us" },
    { href: "/team", label: "Our Team" },
    { href: "/help", label: "Help Center" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact Us" },
  ]

  const legalItems = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    More <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {moreItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  {legalItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Search and Mobile Menu */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Mobile More Items */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="text-sm font-medium text-muted-foreground px-2 py-1 mb-2">More</div>
                  {moreItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1 block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                
                {/* Mobile Legal Items */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="text-sm font-medium text-muted-foreground px-2 py-1 mb-2">Legal</div>
                  {legalItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1 block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
