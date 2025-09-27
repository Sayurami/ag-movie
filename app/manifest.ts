import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AG Movies - Stream Movies & TV Shows',
    short_name: 'AG Movies',
    description: 'Your ultimate destination for streaming movies and TV shows',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/placeholder-logo.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/placeholder-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    categories: ['entertainment', 'video', 'movies', 'tv'],
    lang: 'en',
    orientation: 'portrait',
  }
}
