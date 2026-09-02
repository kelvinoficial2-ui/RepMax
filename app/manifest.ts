import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Foco — Treino pessoal',
    short_name: 'Foco',
    description: 'Seu treino, suas cargas e sua evolução em um só lugar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#091214',
    theme_color: '#091214',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
