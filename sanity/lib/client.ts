import { createClient, type QueryParams } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

// Client is null when projectId is not configured (e.g. build without env vars).
// All fetches through sanityFetch() return null in that case so the build succeeds
// and pages render with empty-state UI.
const _client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      // bypass CDN so Next.js ISR controls caching, not Sanity's CDN layer
      useCdn: false,
      stega: false,
    })
  : null;

/**
 * Fetch from Sanity. Returns `null` when Sanity is not configured.
 * Call sites should treat null the same as an empty / not-found result.
 */
export async function sanityFetch<T>(query: string, params?: QueryParams): Promise<T | null> {
  if (!_client) return null;
  return params ? _client.fetch<T>(query, params) : _client.fetch<T>(query);
}

// Export the raw client only for urlFor() builder; all data fetches should
// use sanityFetch() above.
export const client = _client;
