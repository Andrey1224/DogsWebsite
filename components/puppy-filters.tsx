"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "upcoming", label: "Upcoming" },
];

const breedOptions = [
  { value: "all", label: "All breeds" },
  { value: "french_bulldog", label: "French Bulldog" },
  { value: "english_bulldog", label: "English Bulldog" },
];

export function PuppyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams?.get("status") ?? "all";
  const breed = searchParams?.get("breed") ?? "all";

  const baseParams = useMemo(() => new URLSearchParams(searchParams?.toString() ?? ""), [searchParams]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(baseParams.toString());
    if (value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/70 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-aux">Filters</p>
        <p className="text-xs text-muted">
          Refine by availability and lineage to match your family.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-text">
          Status
          <select
            value={status}
            onChange={(event) => setParam("status", event.target.value)}
            className="rounded-full border border-border bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-text">
          Breed
          <select
            value={breed}
            onChange={(event) => setParam("breed", event.target.value)}
            className="rounded-full border border-border bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none"
          >
            {breedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
