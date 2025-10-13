import { BUSINESS_PROFILE } from "@/lib/config/business";
import { CONTACT_DETAILS } from "@/lib/config/contact";
import { getSiteUrl } from "@/lib/utils/env";
import type { PuppyWithRelations } from "@/lib/supabase/types";

type FAQItem = {
  question: string;
  answer: string;
};

type ReturnPolicyOptions = {
  name: string;
  days?: number;
  fees?: string;
  policyCountry?: string;
  method?: string;
  category?: string;
};

function buildOpeningHoursSpecification() {
  return BUSINESS_PROFILE.hours.map((entry) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: entry.day,
    opens: entry.opens,
    closes: entry.closes,
  }));
}

export function getOrganizationSchema() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS_PROFILE.name,
    legalName: BUSINESS_PROFILE.legalName,
    url: siteUrl,
    logo: BUSINESS_PROFILE.logo,
    slogan: BUSINESS_PROFILE.slogan,
    description: BUSINESS_PROFILE.description,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: CONTACT_DETAILS.phone.e164,
        contactType: "customer service",
        email: CONTACT_DETAILS.email.address,
        areaServed: BUSINESS_PROFILE.areaServed,
        availableLanguage: ["English"],
      },
    ],
    sameAs: [
      CONTACT_DETAILS.whatsapp.link,
      CONTACT_DETAILS.telegram.link,
      "https://instagram.com/exoticbulldoglevel",
      siteUrl,
    ].filter(Boolean),
  };
}

export function getLocalBusinessSchema() {
  const siteUrl = getSiteUrl();
  const hours = buildOpeningHoursSpecification();
  const businessId = `${siteUrl.replace(/\/$/, "")}#localbusiness`;

  return {
    "@context": "https://schema.org",
    "@type": "PetStore",
    additionalType: "https://schema.org/LocalBusiness",
    "@id": businessId,
    name: BUSINESS_PROFILE.name,
    image: BUSINESS_PROFILE.imageGallery,
    url: siteUrl,
    telephone: CONTACT_DETAILS.phone.e164,
    email: CONTACT_DETAILS.email.address,
    priceRange: BUSINESS_PROFILE.priceRange,
    description: BUSINESS_PROFILE.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_PROFILE.address.streetAddress,
      addressLocality: BUSINESS_PROFILE.address.addressLocality,
      addressRegion: BUSINESS_PROFILE.address.addressRegion,
      postalCode: BUSINESS_PROFILE.address.postalCode,
      addressCountry: BUSINESS_PROFILE.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_PROFILE.coordinates.latitude,
      longitude: BUSINESS_PROFILE.coordinates.longitude,
    },
    areaServed: BUSINESS_PROFILE.areaServed.map((region) => ({
      "@type": "AdministrativeArea",
      name: region,
    })),
    openingHoursSpecification: hours,
    sameAs: [
      CONTACT_DETAILS.whatsapp.link,
      CONTACT_DETAILS.telegram.link,
      "https://instagram.com/exoticbulldoglevel",
    ].filter(Boolean),
  };
}

export function getProductSchema(puppy: PuppyWithRelations) {
  const siteUrl = getSiteUrl();
  const url = puppy.slug ? new URL(`/puppies/${puppy.slug}`, siteUrl).toString() : siteUrl;
  const breed = puppy.parents?.sire?.breed ?? puppy.parents?.dam?.breed ?? "bulldog";
  const breedLabel = breed
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const photos = (puppy.photo_urls && puppy.photo_urls.length > 0
    ? puppy.photo_urls
    : ["https://images.exoticbulldog.dev/placeholders/puppy.jpg"]);

  const availabilityMap: Record<string, string> = {
    available: "https://schema.org/InStock",
    reserved: "https://schema.org/PreOrder",
    upcoming: "https://schema.org/PreOrder",
    sold: "https://schema.org/SoldOut",
  };

  const availability = availabilityMap[puppy.status] ?? "https://schema.org/InStock";
  const offers =
    typeof puppy.price_usd === "number"
      ? {
          "@type": "Offer",
          priceCurrency: "USD",
          price: puppy.price_usd,
          availability,
          url,
          seller: {
            "@type": "Organization",
            name: BUSINESS_PROFILE.name,
            url: siteUrl,
          },
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: puppy.name ?? `${breedLabel} Puppy`,
    description:
      puppy.description ??
      `Health-tested ${breedLabel.toLowerCase()} puppy from Exotic Bulldog Level in Montgomery, Alabama.`,
    sku: puppy.id,
    brand: {
      "@type": "Brand",
      name: breedLabel,
    },
    category: "Pets & Animals > Dogs & Puppies",
    image: photos,
    url,
    color: puppy.color ?? undefined,
    weight: puppy.weight_oz
      ? {
          "@type": "QuantitativeValue",
          value: puppy.weight_oz,
          unitCode: "OZ",
        }
      : undefined,
    offers,
  };
}

export function getFaqSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getMerchantReturnPolicySchema(options: ReturnPolicyOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "MerchantReturnPolicy",
    name: options.name,
    merchantReturnDays: options.days ?? 0,
    returnPolicyCategory: options.category ?? "https://schema.org/MerchantReturnNotPermitted",
    returnFees: options.fees ?? "https://schema.org/NonRefundable",
    returnPolicyCountry: options.policyCountry ?? "US",
    returnMethod: options.method ?? "https://schema.org/ReturnInStore",
    applicableCountry: "US",
  };
}
