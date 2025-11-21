'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Filter, Search } from 'lucide-react';

const statusOptions = [
  { value: 'all', label: 'Status' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
  { value: 'upcoming', label: 'Upcoming' },
];

const breedOptions = [
  { value: 'all', label: 'All Breeds' },
  { value: 'french_bulldog', label: 'French Bulldog' },
  { value: 'english_bulldog', label: 'English Bulldog' },
];

const genderOptions = [
  { value: 'all', label: 'Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const priceOptions = [
  { value: 'all', label: 'Price Range' },
  { value: '0-4000', label: 'Under $4,000' },
  { value: '4000-5000', label: '$4,000 - $5,000' },
  { value: '5000-999999', label: 'Over $5,000' },
];

export function PuppyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams?.get('status') ?? 'all';
  const breed = searchParams?.get('breed') ?? 'all';
  const sex = searchParams?.get('sex') ?? 'all';
  const priceRange = searchParams?.get('price') ?? 'all';
  const searchQuery = searchParams?.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchQuery);

  const baseParams = useMemo(
    () => new URLSearchParams(searchParams?.toString() ?? ''),
    [searchParams],
  );

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(baseParams.toString());
    if (value === 'all' || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setParam('search', searchInput);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className="sticky top-4 z-30 mb-12 px-6 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-2xl border border-slate-700/50 bg-[#1E293B]/80 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl md:flex-row">
        {/* Filter label */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Filter size={18} className="text-orange-500" />
          <span className="hidden md:inline">Refine by:</span>
        </div>

        {/* Filter dropdowns */}
        <div className="no-scrollbar flex w-full gap-3 overflow-x-auto pb-2 md:w-auto md:pb-0">
          <div className="relative group">
            <select
              value={breed}
              onChange={(e) => setParam('breed', e.target.value)}
              className="flex cursor-pointer appearance-none items-center gap-2 rounded-full border border-slate-700 bg-[#1E293B] px-4 py-2.5 pr-8 text-sm font-medium text-slate-300 transition-all hover:bg-[#283548] focus:border-orange-500 focus:outline-none"
            >
              {breedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-orange-400"
            />
          </div>

          <div className="relative group">
            <select
              value={sex}
              onChange={(e) => setParam('sex', e.target.value)}
              className="flex cursor-pointer appearance-none items-center gap-2 rounded-full border border-slate-700 bg-[#1E293B] px-4 py-2.5 pr-8 text-sm font-medium text-slate-300 transition-all hover:bg-[#283548] focus:border-orange-500 focus:outline-none"
            >
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-orange-400"
            />
          </div>

          <div className="relative group">
            <select
              value={priceRange}
              onChange={(e) => setParam('price', e.target.value)}
              className="flex cursor-pointer appearance-none items-center gap-2 rounded-full border border-slate-700 bg-[#1E293B] px-4 py-2.5 pr-8 text-sm font-medium text-slate-300 transition-all hover:bg-[#283548] focus:border-orange-500 focus:outline-none"
            >
              {priceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-orange-400"
            />
          </div>

          <div className="relative group">
            <select
              value={status}
              onChange={(e) => setParam('status', e.target.value)}
              className="flex cursor-pointer appearance-none items-center gap-2 rounded-full border border-slate-700 bg-[#1E293B] px-4 py-2.5 pr-8 text-sm font-medium text-slate-300 transition-all hover:bg-[#283548] focus:border-orange-500 focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-orange-400"
            />
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-auto">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-full border border-slate-700 bg-[#0B1120] py-2.5 pl-10 pr-4 text-sm text-white transition-colors focus:border-orange-500/50 focus:outline-none md:w-64"
          />
        </div>
      </div>
    </div>
  );
}
