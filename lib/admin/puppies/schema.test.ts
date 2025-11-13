import { describe, expect, it } from "vitest";

import { createPuppySchema } from "./schema";

const basePayload = {
  name: "Test Puppy",
  status: "available" as const,
  slug: "test-puppy",
};

describe("createPuppySchema photoUrls", () => {
  it("accepts up to three valid URLs", () => {
    const result = createPuppySchema.safeParse({
      ...basePayload,
      photoUrls: [
        "https://example.com/one.jpg",
        "https://example.com/two.jpg",
        "https://example.com/three.jpg",
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.photoUrls).toHaveLength(3);
    }
  });

  it("rejects more than three URLs", () => {
    const result = createPuppySchema.safeParse({
      ...basePayload,
      photoUrls: [
        "https://example.com/one.jpg",
        "https://example.com/two.jpg",
        "https://example.com/three.jpg",
        "https://example.com/four.jpg",
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Select up to 3 photos");
    }
  });
});
