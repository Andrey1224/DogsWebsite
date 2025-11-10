import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/utils/env";
import { resolveLocalImage } from "@/lib/utils/images";

type ImageInput =
  | string
  | {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };

export type SeoOptions = {
  /**
   * Page-specific title. The global template is applied automatically.
   */
  title: string;
  /**
   * Short summary displayed in SERP snippets and cards.
   */
  description: string;
  /**
   * Relative path or absolute URL for canonical references.
   */
  path?: string;
  /**
   * Optional hero image for Open Graph / Twitter cards.
   */
  image?: ImageInput;
  /**
   * Allow opting out of indexing for draft/system pages.
   */
  noIndex?: boolean;
};

const SITE_NAME = "Exotic Bulldog Legacy";
const DEFAULT_DESCRIPTION =
  "Health-first French & English bulldog breeding in Alabama with transparent pedigrees, concierge ownership support, and secure deposit flows.";
const DEFAULT_IMAGE = "/reviews/sarah-charlie.webp";

function resolveImage(image?: ImageInput) {
  if (!image) {
    return {
      url: DEFAULT_IMAGE,
      alt: "French and English bulldogs from Exotic Bulldog Legacy",
    };
  }

  if (typeof image === "string") {
    return { url: resolveLocalImage(image, DEFAULT_IMAGE) };
  }

  return {
    ...image,
    url: resolveLocalImage(image.url, DEFAULT_IMAGE),
  };
}

export function getDefaultMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      images: [resolveImage()],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      images: [resolveImage().url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: SeoOptions): Metadata {
  const siteUrl = getSiteUrl();
  const resolvedImage = resolveImage(image);
  const canonical = path
    ? new URL(path.startsWith("/") ? path : `/${path}`, siteUrl).toString()
    : siteUrl;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      images: [resolvedImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolvedImage.url],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  };
}
