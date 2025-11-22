import React, { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  PawPrint,
  LogOut,
  Search,
  Plus,
  Filter,
  ChevronDown,
  Save,
  RotateCcw,
  ExternalLink,
  Archive,
  Image as ImageIcon,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Calendar,
} from 'lucide-react';

// --- Mock Data ---
const mockPuppies = [
  {
    id: 1,
    name: 'Duddy',
    slug: 'duddy',
    breed: 'French Bulldog',
    status: 'Available',
    price: 4200,
    dob: '2024-12-18',
    img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    hasReservation: false,
  },
  {
    id: 2,
    name: 'Charlie',
    slug: 'charlie',
    breed: 'English Bulldog',
    status: 'Sold',
    price: 4000,
    dob: '2025-07-05',
    img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    hasReservation: false,
  },
  {
    id: 3,
    name: 'Rocco',
    slug: 'rocco',
    breed: 'English Bulldog',
    status: 'Reserved',
    price: 4500,
    dob: '2025-08-10',
    img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    hasReservation: true, // Highlight this
  },
];

const mockReviews = [
  {
    id: 1,
    author: 'Sarah W.',
    status: 'Published',
    rating: 5,
    date: 'Oct 14, 2025',
    text: 'Flawless experience!',
  },
  {
    id: 2,
    author: 'Mike T.',
    status: 'Pending',
    rating: 4,
    date: 'Nov 01, 2025',
    text: 'Great pup, tricky pickup.',
  },
];

// --- Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    Available: 'bg-green-500/20 text-green-400 border-green-500/30',
    Reserved: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Sold: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    Upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Archived: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.Available}`}
    >
      {status}
    </span>
  );
};

const PuppyRow = ({ puppy }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Local state for inline editing
  const [status, setStatus] = useState(puppy.status);
  const [price, setPrice] = useState(puppy.price);
  const [dob, setDob] = useState(puppy.dob);

  return (
    <div
      className={`
      group bg-[#1E293B]/40 border transition-all duration-300 overflow-hidden
      ${isExpanded ? 'rounded-[2rem] border-orange-500/30 bg-[#1E293B]/80 shadow-2xl' : 'rounded-xl border-slate-800/50 hover:border-slate-700'}
    `}
    >
      {/* Summary Row (Always Visible) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center gap-4 cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
          <img src={puppy.img} alt={puppy.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <h4 className="font-bold text-white text-lg flex items-center gap-2">
              {puppy.name}
              {puppy.hasReservation && (
                <span
                  className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"
                  title="Active Reservation"
                />
              )}
            </h4>
            <p className="text-xs text-slate-500">{puppy.breed}</p>
          </div>

          <div className="hidden md:block">
            <StatusBadge status={status} />
          </div>

          <div className="hidden md:block text-sm text-slate-300 font-mono">
            ${price.toLocaleString()}
          </div>

          <div className="hidden md:block text-sm text-slate-400">
            {new Date(dob).toLocaleDateString()}
          </div>
        </div>

        {/* Actions Toggle */}
        <div
          className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-slate-800 text-white' : 'text-slate-500'}`}
        >
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Expanded Edit Panel */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-700/50 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Inline Edit Fields */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Status</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer hover:bg-slate-900 transition-colors"
                  >
                    <option>Available</option>
                    <option>Reserved</option>
                    <option>Sold</option>
                    <option>Upcoming</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-3 text-slate-500 pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">
                  Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg py-2 pl-6 pr-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                  <Save size={14} /> Save
                </button>
                <button className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Date & Info */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Birth Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <AlertCircle size={14} />
                  <span className="text-xs font-bold">Quick Tip</span>
                </div>
                <p className="text-[10px] text-blue-300/80 leading-relaxed">
                  Changing status to "Reserved" will trigger a notification to the waitlist if
                  enabled.
                </p>
              </div>
            </div>

            {/* External Actions */}
            <div className="flex flex-col gap-2 justify-end">
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700">
                Full Edit Panel <ExternalLink size={14} />
              </button>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700">
                Open Public Page <ExternalLink size={14} />
              </button>
              <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-red-500/20 mt-auto">
                Archive Puppy <Archive size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('puppies');
  const [viewArchive, setViewArchive] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#111827]/50 border-r border-slate-800/50 flex-shrink-0">
        <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 rounded-lg">
            <PawPrint className="text-orange-500" size={20} />
          </div>
          <div>
            <div className="font-bold text-sm text-white">EBL Dashboard</div>
            <div className="text-[10px] text-slate-500">owner@example.com</div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('puppies')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'puppies' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <PawPrint size={18} /> Puppies
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'reviews' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <MessageSquare size={18} /> Reviews
          </button>
        </nav>

        <div className="mt-auto p-4">
          <button className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {/* Background Glows */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header Area */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {activeTab === 'puppies' ? 'Manage Puppies' : 'Review Moderation'}
            </h1>
            <p className="text-slate-400 text-sm">
              {activeTab === 'puppies'
                ? 'Track inventory, pricing, and litter details.'
                : 'Approve, edit, or hide customer testimonials.'}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {activeTab === 'puppies' && (
              <button className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-white/5 hover:shadow-orange-500/20 flex items-center gap-2">
                <Plus size={16} /> Add New Puppy
              </button>
            )}
          </div>
        </header>

        {/* --- PUPPIES TAB --- */}
        {activeTab === 'puppies' && (
          <div className="space-y-6 relative z-10">
            {/* Sub-nav / Filters */}
            <div className="flex items-center gap-6 border-b border-slate-800 pb-1 mb-6">
              <button
                onClick={() => setViewArchive(false)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${!viewArchive ? 'border-orange-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Active Listings
              </button>
              <button
                onClick={() => setViewArchive(true)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${viewArchive ? 'border-orange-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Archived
              </button>
            </div>

            {/* Quick Add Banner */}
            {!viewArchive && (
              <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:border-orange-500/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Draft a new listing</h3>
                    <p className="text-xs text-slate-400">
                      Create a profile, upload gallery & parent photos.
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </div>
              </div>
            )}

            {/* List */}
            <div className="space-y-3">
              {/* Table Header (Pseudo) */}
              <div className="hidden md:grid grid-cols-4 gap-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <div>Name / Info</div>
                <div>Status</div>
                <div>Price</div>
                <div>Birth Date</div>
              </div>

              {mockPuppies.map((puppy) => (
                <PuppyRow key={puppy.id} puppy={puppy} />
              ))}
            </div>
          </div>
        )}

        {/* --- REVIEWS TAB --- */}
        {activeTab === 'reviews' && (
          <div className="relative z-10">
            {/* Filters Bar */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              <button className="bg-[#1E293B] text-white px-4 py-2 rounded-full text-sm font-medium border border-slate-700 whitespace-nowrap">
                All Reviews
              </button>
              <button className="bg-transparent text-slate-400 px-4 py-2 rounded-full text-sm font-medium border border-slate-800 hover:border-slate-600 whitespace-nowrap">
                Pending Approval
              </button>
              <button className="bg-transparent text-slate-400 px-4 py-2 rounded-full text-sm font-medium border border-slate-800 hover:border-slate-600 whitespace-nowrap">
                Facebook Imports
              </button>
            </div>

            <div className="space-y-4">
              {mockReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[#1E293B]/40 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-white">{review.author}</div>
                      <StatusBadge status={review.status} />
                      <span className="text-xs text-slate-500">{review.date}</span>
                    </div>
                    <button className="text-slate-500 hover:text-white">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <p className="text-slate-300 text-sm mb-4">"{review.text}"</p>
                  <div className="flex gap-3 pt-3 border-t border-slate-700/30">
                    <button className="text-xs font-bold text-green-400 hover:text-green-300 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1">
                      Edit Content
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
