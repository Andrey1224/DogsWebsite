import React, { useState } from 'react';
import { Filter, ChevronDown, Heart, Search, ArrowUpRight, ShieldCheck } from 'lucide-react';

// Mock Data reflecting the screenshot content but expanded
const puppies = [
  {
    id: 1,
    name: 'Charlie',
    breed: 'English Bulldog',
    color: 'Lilac Tri',
    price: 4000,
    status: 'Sold',
    img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    desc: 'Charlie is a show-stopper with perfect rope and bone structure. He has a calm demeanor and loves belly rubs.',
  },
  {
    id: 2,
    name: 'Bella',
    breed: 'French Bulldog',
    color: 'Blue Merle',
    price: 5500,
    status: 'Available',
    img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    desc: "Playful and curious, Bella is ready to find her forever home. She's been raised around kids and other pets.",
  },
  {
    id: 3,
    name: 'Rocco',
    breed: 'English Bulldog',
    color: 'Chocolate',
    price: 4200,
    status: 'Reserved',
    img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    desc: 'A true tank! Rocco has a massive head and chest. He is currently reserved pending final pickup arrangements.',
  },
  {
    id: 4,
    name: 'Luna',
    breed: 'French Bulldog',
    color: 'Cream',
    price: 4800,
    status: 'Available',
    img: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    desc: 'Sweet natured and quiet. Luna is the perfect apartment companion looking for a loving lap to nap on.',
  },
];

const FilterDropdown = ({ label, options }) => (
  <div className="relative group">
    <button className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#283548] text-slate-300 px-4 py-2.5 rounded-full border border-slate-700 transition-all">
      <span className="text-sm font-medium">{label}</span>
      <ChevronDown
        size={16}
        className="text-slate-500 group-hover:text-orange-400 transition-colors"
      />
    </button>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Available: 'bg-green-500/20 text-green-400 border-green-500/30',
    Sold: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    Reserved: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${styles[status] || styles.Available}`}
    >
      {status}
    </span>
  );
};

export default function PuppiesPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans pb-20">
      {/* Header Section */}
      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto relative">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="text-orange-400 font-bold tracking-widest text-xs uppercase mb-3 pl-1">
              Current Litters
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              French & English bulldogs <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">
                available now
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Browse our current litters, review temperament notes, and reserve the companion who
              fits your lifestyle.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-4 z-30 px-6 md:px-12 mb-12">
        <div className="max-w-7xl mx-auto bg-[#1E293B]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Filter size={18} className="text-orange-500" />
            <span className="hidden md:inline">Refine by:</span>
          </div>

          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <FilterDropdown label="All Breeds" />
            <FilterDropdown label="Gender" />
            <FilterDropdown label="Price Range" />
            <FilterDropdown label="Status: Available" />
          </div>

          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full md:w-64 bg-[#0B1120] border border-slate-700 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {puppies.map((puppy) => (
            <div
              key={puppy.id}
              className="group bg-[#151e32] rounded-[2rem] p-3 border border-slate-800 hover:border-orange-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-900/10 hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-5">
                <img
                  src={puppy.img}
                  alt={puppy.name}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${puppy.status === 'Sold' ? 'grayscale opacity-60' : ''}`}
                />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-black/40 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full border border-white/10">
                    {puppy.breed}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <StatusBadge status={puppy.status} />
                </div>

                {/* Hover Actions */}
                {puppy.status === 'Available' && (
                  <div className="absolute bottom-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                    <button className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-orange-400 hover:text-white transition-colors">
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-3 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                      {puppy.name}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium">{puppy.color}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      ${puppy.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                  {puppy.desc}
                </p>

                <div className="flex gap-3 border-t border-slate-800 pt-4">
                  {puppy.status === 'Available' ? (
                    <>
                      <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange-500/20">
                        Reserve Now
                      </button>
                      <button className="p-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
                        <Heart size={20} />
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-slate-800 text-slate-500 py-3 rounded-xl font-semibold text-sm cursor-not-allowed"
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
