import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Exotic Bulldog Legacy - Premium French & English Bulldog Breeder',
    short_name: 'Exotic Bulldog Legacy',
    description:
      'French and English Bulldog breeder in Falkville, AL. Family-raised, vet-checked puppies with ongoing breeder support.',
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
