import React, { useState } from 'react';
import { Star, MapPin, Camera, UploadCloud, CheckCircle2, ArrowRight, Quote } from 'lucide-react';

// --- Mock Data ---
const reviews = [
  {
    id: 1,
    name: 'Sarah W.',
    location: 'Huntsville, AL',
    date: 'June 2025',
    text: "We picked up our French Bulldog, Charlie, in June and he's been the sweetest, health-set puppy we've ever had. The whole process was transparent and stress-free.",
    rating: 5,
    img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Mark & Lisa P.',
    location: 'Birmingham, AL',
    date: 'July 2025',
    text: 'Our English Bulldog Duke is doing amazing! He was already socialized and mostly potty trained. The deposit and pickup process were super easy and professional.',
    rating: 5,
    img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Anthony D.',
    location: 'Montgomery, AL',
    date: 'May 2025',
    text: 'Top-notch breeder! You can tell they truly care for their dogs. My Frenchie, Tommy, settled in immediately and has the funniest personality.',
    rating: 5,
    // Text only review
  },
  {
    id: 4,
    name: 'Jessica M.',
    location: 'Nashville, TN',
    date: 'August 2025',
    text: 'I was nervous about buying online, but Exotic Bulldog Legacy made everything smooth. We received videos and updates right up until delivery day. Bella arrived happy, healthy, and ready to cuddle.',
    rating: 5,
    img: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    name: 'Cameron H.',
    location: 'Decatur, AL',
    date: 'September 2025',
    text: 'I loved how easy it was to reserve online. PayPal worked perfectly and the confirmation emails arrived instantly. Milo is already the star of our neighborhood!',
    rating: 5,
    img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    name: 'Rachel K.',
    location: 'Atlanta, GA',
    date: 'July 2025',
    text: 'We drove from Georgia because the quality of their bulldogs is worth it. The one-year health guarantee gave us confidence.',
    rating: 5,
  },
];

const StatCard = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 bg-[#1E293B]/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
    <div className="bg-orange-500/10 p-3 rounded-xl text-orange-400">{icon}</div>
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans pb-20">
      {/* --- Header & Stats --- */}
      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto relative">
        {/* Background Decor */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
          <div className="text-orange-400 font-bold tracking-widest text-xs uppercase mb-3">
            Verified Reviews
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Families who chose <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
              Exotic Bulldog Legacy
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            From first kennel visits to flight nanny hand-offs, our team stays involved at every
            step. These stories highlight the transparent experience we deliver.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-20">
          <StatCard
            label="Average Rating"
            value="5.0 / 5.0"
            icon={<Star className="fill-orange-400" />}
          />
          <StatCard label="Happy Families" value="120+" icon={<CheckCircle2 />} />
          <StatCard label="States Served" value="14" icon={<MapPin />} />
        </div>
      </div>

      {/* --- Reviews Grid (Masonry) --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-32">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="break-inside-avoid bg-[#151e32] p-6 rounded-3xl border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <Quote
                  size={20}
                  className="text-slate-700 group-hover:text-orange-500/50 transition-colors"
                />
              </div>

              <p className="text-slate-300 leading-relaxed mb-6 text-sm">"{review.text}"</p>

              {review.img && (
                <div className="mb-6 rounded-2xl overflow-hidden aspect-video relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                  <img
                    src={review.img}
                    alt="Review"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-orange-400 font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{review.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={10} /> {review.location} •{' '}
                    <span className="text-slate-600">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Leave a Review Form Section --- */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-purple-600/5 blur-3xl -z-10 rounded-full opacity-50" />

        <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-slate-700 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Share your experience</h2>
            <p className="text-slate-400">
              Tell future families what the adoption process felt like. We publish reviews
              instantly.
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan M."
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  City & State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Atlanta, GA"
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                How was the experience?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className={`flex-1 py-3 rounded-xl border transition-all font-bold text-sm flex items-center justify-center gap-1
                      ${
                        rating === 5
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                          : 'bg-[#0B1120] border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                      }
                    `}
                  >
                    {rating} <Star size={14} className={rating === 5 ? 'fill-white' : ''} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Your Story
              </label>
              <textarea
                rows={4}
                placeholder="Share how pickup day felt, what stood out during the process, or how your pup is doing now..."
                className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:bg-[#0B1120]/50 transition-colors cursor-pointer group">
              <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="text-orange-400" />
              </div>
              <h4 className="text-white font-medium text-sm mb-1">Add photos (optional)</h4>
              <p className="text-slate-500 text-xs">
                Up to 3 JPG, PNG or WebP photos under 5MB each.
              </p>
            </div>

            {/* Submit Button */}
            <button className="w-full bg-white hover:bg-slate-200 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl">
              Publish my review <ArrowRight size={18} />
            </button>

            <p className="text-center text-[10px] text-slate-600">
              By submitting you agree we may quote your story on ExoticBulldogLegacy.com and
              marketing emails.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
