import { describe, expect, it } from "vitest";

import { applyPuppyFilters } from "./queries";
import type { PuppyWithRelations } from "./types";

const basePuppy = {
  id: "id-1",
  litter_id: "litter-1",
  name: "Duke",
  slug: "duke",
  sex: "male",
  color: "Brindle",
  birth_date: "2024-10-12",
  price_usd: 4200,
  status: "available",
  weight_oz: 38,
  description: "",
  photo_urls: [] as string[],
  video_urls: [] as string[],
  paypal_enabled: true,
  stripe_payment_link: null,
  created_at: "",
  updated_at: "",
};

const puppies: PuppyWithRelations[] = [
  {
    ...basePuppy,
    id: "available-french",
    status: "available",
    parents: {
      sire: { id: "sire-1", name: "Pierre", slug: "pierre", breed: "french_bulldog", sex: "male", birth_date: null, weight_lbs: null, color: null, description: null, health_clearances: null, photo_urls: null, video_urls: null, created_at: null },
      dam: { id: "dam-1", name: "Colette", slug: "colette", breed: "french_bulldog", sex: "female", birth_date: null, weight_lbs: null, color: null, description: null, health_clearances: null, photo_urls: null, video_urls: null, created_at: null },
    },
    litter: null,
  },
  {
    ...basePuppy,
    id: "reserved-english",
    status: "reserved",
    parents: {
      sire: { id: "sire-2", name: "Sir Winston", slug: "sir-winston", breed: "english_bulldog", sex: "male", birth_date: null, weight_lbs: null, color: null, description: null, health_clearances: null, photo_urls: null, video_urls: null, created_at: null },
      dam: { id: "dam-2", name: "Lady Clementine", slug: "lady-clementine", breed: "english_bulldog", sex: "female", birth_date: null, weight_lbs: null, color: null, description: null, health_clearances: null, photo_urls: null, video_urls: null, created_at: null },
    },
    litter: null,
  },
  {
    ...basePuppy,
    id: "upcoming-english",
    status: "upcoming",
    parents: {
      sire: null,
      dam: { id: "dam-3", name: "Harper", slug: "harper", breed: "english_bulldog", sex: "female", birth_date: null, weight_lbs: null, color: null, description: null, health_clearances: null, photo_urls: null, video_urls: null, created_at: null },
    },
    litter: null,
  },
];

describe("applyPuppyFilters", () => {
  it("returns all puppies when filters are default", () => {
    const result = applyPuppyFilters(puppies, { status: "all", breed: "all" });
    expect(result).toHaveLength(3);
  });

  it("filters by status", () => {
    const result = applyPuppyFilters(puppies, { status: "available", breed: "all" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("available-french");
  });

  it("filters by breed using sire or dam data", () => {
    const result = applyPuppyFilters(puppies, { status: "all", breed: "english_bulldog" });
    expect(result.map((puppy) => puppy.id)).toEqual([
      "reserved-english",
      "upcoming-english",
    ]);
  });

  it("returns empty when no entries meet filter", () => {
    const result = applyPuppyFilters(puppies, { status: "sold", breed: "french_bulldog" });
    expect(result).toHaveLength(0);
  });
});
