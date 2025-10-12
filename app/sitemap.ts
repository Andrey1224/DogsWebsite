import type { MetadataRoute } from "next";

import { getPuppies } from "@/lib/supabase/queries";
import { getSiteUrl } from "@/lib/utils/env";

const STATIC_ROUTES = ["", "/about", "/puppies", "/contact", "/policies", "/faq"];

function withBase(path: string, base: string) {
  if (!path) return base;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalizedBase}${path}`;
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const puppies = await getPuppies();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: withBase(route, siteUrl),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
    lastModified: new Date(),
  }));

  const puppyEntries: MetadataRoute.Sitemap = puppies
    .filter((puppy) => Boolean(puppy.slug))
    .map((puppy) => ({
      url: withBase(`/puppies/${puppy.slug}`, siteUrl),
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: puppy.updated_at ?? puppy.created_at ?? undefined,
    }));

  return [...staticEntries, ...puppyEntries];
}
