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
      ...supabaseRemotePattern,
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
