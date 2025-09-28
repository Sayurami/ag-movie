import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ag.micorp.pro'
  
  return NextResponse.json({
    success: true,
    message: 'Sitemap test endpoint',
    sitemaps: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-index.xml`,
      `${baseUrl}/api/sitemap`
    ],
    robots: `${baseUrl}/robots.txt`,
    timestamp: new Date().toISOString()
  })
}
