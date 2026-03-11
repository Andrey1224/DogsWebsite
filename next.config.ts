import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
];

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseRemotePattern: RemotePattern[] = supabaseUrl
  ? [
      {
        protocol: 'https',
        hostname: new URL(supabaseUrl).hostname,
        pathname: '/storage/v1/object/**',
      },
    ]
  : [];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.exoticbulldog.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      ...supabaseRemotePattern,
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async headers() {
    return [
      {
        // Security headers for all routes except /studio (Studio uses iframes internally)
        source: '/((?!studio).*)',
        headers: securityHeaders,
      },
      {
        // Studio gets all headers except X-Frame-Options so its iframes can function
        source: '/studio(.*)',
        headers: securityHeaders.filter((h) => h.key !== 'X-Frame-Options'),
      },
    ];
  },
};

export default nextConfig;
