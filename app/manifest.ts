import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Exotic Bulldog Legacy - Premium French & English Bulldog Breeder',
    short_name: 'Exotic Bulldog Legacy',
    description:
      'Premium French and English Bulldog breeder in Falkville, AL. Family-raised puppies with health guarantees and lifetime support.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9FAFB',
    theme_color: '#FFB84D',
    orientation: 'portrait-primary',
    categories: ['pets', 'lifestyle'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
