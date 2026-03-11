import * as crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/revalidate/blog
 *
 * Called by a Sanity webhook after a post is published, updated, or deleted.
 * Requires header:  x-sanity-secret: <SANITY_REVALIDATE_SECRET>
 *
 * Sanity webhook setup:
 *   URL:     https://yourdomain.com/api/revalidate/blog
 *   Method:  POST
 *   Trigger: on publish / on update / on delete  (filter: _type == "post")
 *   Header:  x-sanity-secret = <your SANITY_REVALIDATE_SECRET value>
 *
 * Slug-change behaviour:
 *   Both the old cached page (now a 404) and the new slug page are invalidated
 *   because revalidatePath('/blog/[slug]', 'page') clears all cached /blog/[slug]
 *   pages. The new slug is generated on-demand on next request.
 */
function timingSafeEqual(a: string, b: string): boolean {
  try {
    // Buffer.byteLength may differ from string length for multi-byte chars;
    // compare byte buffers to avoid length-leak bypasses.
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.byteLength !== bufB.byteLength) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const expected = process.env.SANITY_REVALIDATE_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: 'SANITY_REVALIDATE_SECRET is not configured on the server' },
      { status: 500 },
    );
  }

  const provided = request.headers.get('x-sanity-secret') ?? '';

  if (!timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Revalidate blog listing and all individual post pages
  revalidatePath('/blog', 'page');
  revalidatePath('/blog/[slug]', 'page');

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}
