"use client"

import { Button } from "@/components/ui/button"
import { Instagram, MessageCircle } from "lucide-react"

export function SocialMediaButtons() {
  const instagramUrl = "https://www.instagram.com/_ag_movie?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
  const whatsappNumber = "250793081660"
  const whatsappMessage = "Hello! I'd like to get more info about Agasobanuye Movies"
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
      {/* Instagram Follow Button */}
      <Button
        asChild
        variant="outline"
        size="lg"
        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
      >
        <a 
          href={instagramUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Instagram className="h-5 w-5" />
          <span className="font-semibold">Follow @ag_movie</span>
        </a>
      </Button>

      {/* WhatsApp Contact Button */}
      <Button
        asChild
        variant="outline"
        size="lg"
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
      >
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">WhatsApp Info</span>
        </a>
      </Button>
    </div>
  )
}
