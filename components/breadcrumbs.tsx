import Link from "next/link";

import { getSiteUrl } from "@/lib/utils/env";

export type BreadcrumbItem = {
  label: string;
  href: string;
};

function buildJsonLd(items: BreadcrumbItem[]) {
  const siteUrl = getSiteUrl();

  const itemListElement = items.map((item, index) => {
    const url = item.href.startsWith("http") ? item.href : new URL(item.href, siteUrl).toString();
    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": url,
        name: item.label,
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) {
    return null;
  }

  const lastIndex = items.length - 1;
  const jsonLd = buildJsonLd(items);

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isCurrent = index === lastIndex;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {isCurrent ? (
                <span className="font-medium text-text">{item.label}</span>
              ) : (
                <Link href={item.href} className="transition hover:text-accent-aux">
                  {item.label}
                </Link>
              )}
              {index < lastIndex ? (
                <span aria-hidden="true" className="text-xs text-border">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
