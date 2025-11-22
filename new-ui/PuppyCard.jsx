import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  Calendar,
  Weight,
  Dna,
  ShieldCheck,
  Info,
  ChevronRight,
  Star,
  CheckCircle2,
  Lock,
  Activity,
  Quote,
} from 'lucide-react';

const puppyData = {
  name: 'Duddy',
  breed: 'French Bulldog',
  price: 4200,
  status: 'Available',
  dob: 'Dec 18, 2024',
  gender: 'Female',
  color: 'Blue',
  weight: '24 oz (Est. Adult: 25 lbs)',
  description: 'My loved puppy I love his so much so yes just Love him so much!)))',
  images: [
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  ],
  sire: {
    name: 'Gohan',
    img: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    title: 'Grand Champion',
    weight: '28 lbs',
    color: 'Lilac Tan',
    dna: '4 Panel Clear',
    desc: "Gohan is the definition of a gentle giant. Despite his muscular build, he's a total couch potato who loves nothing more than napping at your feet. He passes on his calm, 'chill' demeanor to all his pups.",
  },
  dam: {
    name: 'Elizabeth',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    title: 'International Lineage',
    weight: '24 lbs',
    color: 'Blue',
    dna: 'Health Tested',
    desc: "Elizabeth is playful, attentive, and incredibly smart. She's the alpha of the pack but leads with kindness. Her puppies tend to inherit her curiosity and quick learning ability.",
  },
};

// Helper component for Parent Stats
const ParentStat = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-[#151e32] p-3 rounded-xl border border-slate-800">
    <div className="text-slate-500">{icon}</div>
    <div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  </div>
);

export default function PuppyDetails() {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans pb-20">
      {/* --- Nav / Breadcrumbs --- */}
      <div className="pt-8 px-6 md:px-12 max-w-7xl mx-auto flex items-center gap-2 text-sm text-slate-400 mb-8">
        <button className="hover:text-white flex items-center gap-1 transition-colors">
          <ArrowLeft size={16} /> Back to Puppies
        </button>
        <span className="text-slate-700">/</span>
        <span className="text-slate-500">{puppyData.breed}</span>
        <span className="text-slate-700">/</span>
        <span className="text-white font-medium">{puppyData.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* --- Left Column: Gallery --- */}
        <div className="space-y-6">
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border border-slate-700/50 shadow-2xl shadow-black/50 group">
            <img
              src={puppyData.images[activeImage]}
              alt={puppyData.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Status Badge Overlay */}
            <div className="absolute top-6 left-6">
              {puppyData.status === 'Sold' ? (
                <div className="bg-slate-900/80 backdrop-blur-md text-slate-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-700 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Sold
                </div>
              ) : (
                <div className="bg-green-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-green-500/20 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Available
                </div>
              )}
            </div>

            <button className="absolute top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-white">
              <Share2 size={20} />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {puppyData.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all ${
                  activeImage === idx
                    ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#0B1120] opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* --- Right Column: Details --- */}
        <div className="flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-orange-400 font-bold tracking-wider text-xs uppercase bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              {puppyData.breed}
            </span>
            <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
              <MapPin size={12} /> Alabama
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">{puppyData.name}</h1>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-3xl font-medium text-slate-200">
              ${puppyData.price.toLocaleString()}
            </span>
            {puppyData.status === 'Sold' && (
              <span className="text-slate-500 text-sm line-through">$4,500</span>
            )}
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1E293B]/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                <Calendar size={14} className="text-orange-500" /> DOB
              </div>
              <div className="text-white font-medium">{puppyData.dob}</div>
            </div>
            <div className="bg-[#1E293B]/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                <Dna size={14} className="text-blue-500" /> Gender
              </div>
              <div className="text-white font-medium">{puppyData.gender}</div>
            </div>
            <div className="bg-[#1E293B]/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                <Star size={14} className="text-purple-500" /> Color
              </div>
              <div className="text-white font-medium">{puppyData.color}</div>
            </div>
            <div className="bg-[#1E293B]/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                <Weight size={14} className="text-green-500" /> Est. Weight
              </div>
              <div className="text-white font-medium">{puppyData.weight}</div>
            </div>
          </div>

          {/* Description & Notes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">Temperament & Notes</h3>
            <p className="text-slate-400 leading-relaxed text-sm">{puppyData.description}</p>
          </div>

          {/* Health Guarantee Badge */}
          <div className="mb-8 flex items-center gap-3 bg-[#1E293B] p-4 rounded-xl border border-slate-700/50">
            <div className="bg-green-500/20 p-2 rounded-full">
              <ShieldCheck className="text-green-400" size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Health Guarantee Included</div>
              <div className="text-xs text-slate-400">
                Vet checked, vaccinated, and microchipped.
              </div>
            </div>
          </div>

          {/* --- PAYMENT & ACTIONS SECTION --- */}
          <div className="space-y-5">
            {puppyData.status === 'Available' ? (
              <>
                {/* Stripe / Main Action */}
                <div>
                  <button className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-orange-500/20 mb-2 hover:scale-[1.01] active:scale-[0.99]">
                    Reserve {puppyData.name}
                  </button>
                  <div className="text-center text-[10px] text-slate-500 font-medium flex justify-center items-center gap-1">
                    $300 deposit • Powered by <Lock size={8} /> Stripe
                  </div>
                </div>

                {/* PayPal Section */}
                <div className="bg-[#151e32] rounded-2xl p-4 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                    Or pay with
                  </div>
                  <button className="w-full bg-[#FFC439] hover:bg-[#F4BB29] text-[#003087] py-3 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
                    <span className="italic font-bold">Pay</span>
                    <span className="italic font-bold text-[#009cde]">Pal</span>
                  </button>
                  <div className="text-center text-[10px] text-slate-500 mt-2">
                    The safer, easier way to pay
                  </div>
                </div>
              </>
            ) : (
              <button className="w-full bg-slate-800 text-slate-400 py-4 rounded-2xl font-bold text-lg cursor-not-allowed border border-slate-700">
                Already Reserved
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Lineage Section (Updated with Stats & Bio) --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px bg-slate-800 flex-1"></div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest text-center">
            Premium Lineage
          </h2>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Sire Card */}
          <div className="space-y-6">
            <div className="relative h-80 rounded-[2rem] overflow-hidden group border border-slate-800 shadow-2xl">
              <img
                src={puppyData.sire.img}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Sire"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <div className="text-orange-400 text-xs font-bold tracking-wider uppercase mb-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                  The Sire (Father)
                </div>
                <h3 className="text-4xl font-bold text-white mb-1">{puppyData.sire.name}</h3>
                <p className="text-slate-300 text-sm font-medium">{puppyData.sire.title}</p>
              </div>
            </div>

            {/* Sire Stats */}
            <div className="grid grid-cols-2 gap-4">
              <ParentStat
                icon={<Weight size={16} />}
                label="Weight"
                value={puppyData.sire.weight}
              />
              <ParentStat icon={<Star size={16} />} label="Color" value={puppyData.sire.color} />
              <ParentStat icon={<Activity size={16} />} label="Health" value={puppyData.sire.dna} />
            </div>

            {/* Sire Bio */}
            <div className="bg-[#1E293B]/30 p-5 rounded-2xl border border-slate-800/50 flex gap-3">
              <Quote className="text-orange-500 flex-shrink-0" size={20} />
              <p className="text-slate-400 text-sm italic leading-relaxed">
                "{puppyData.sire.desc}"
              </p>
            </div>
          </div>

          {/* Dam Card */}
          <div className="space-y-6">
            <div className="relative h-80 rounded-[2rem] overflow-hidden group border border-slate-800 shadow-2xl">
              <img
                src={puppyData.dam.img}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Dam"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <div className="text-pink-400 text-xs font-bold tracking-wider uppercase mb-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                  The Dam (Mother)
                </div>
                <h3 className="text-4xl font-bold text-white mb-1">{puppyData.dam.name}</h3>
                <p className="text-slate-300 text-sm font-medium">{puppyData.dam.title}</p>
              </div>
            </div>

            {/* Dam Stats */}
            <div className="grid grid-cols-2 gap-4">
              <ParentStat icon={<Weight size={16} />} label="Weight" value={puppyData.dam.weight} />
              <ParentStat icon={<Star size={16} />} label="Color" value={puppyData.dam.color} />
              <ParentStat icon={<Activity size={16} />} label="Health" value={puppyData.dam.dna} />
            </div>

            {/* Dam Bio */}
            <div className="bg-[#1E293B]/30 p-5 rounded-2xl border border-slate-800/50 flex gap-3">
              <Quote className="text-pink-500 flex-shrink-0" size={20} />
              <p className="text-slate-400 text-sm italic leading-relaxed">
                "{puppyData.dam.desc}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
