import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Send,
  MessageCircle,
  Clock,
  ArrowUpRight,
  Navigation,
} from 'lucide-react';

const footerLinks = [
  { title: 'Explore', items: ['Available Puppies', 'Reviews', 'Our Story', 'Health Policy'] },
  { title: 'Support', items: ['FAQ', 'Contact Us', 'Deposit Terms', 'Flight Nanny Info'] },
];

const hours = [
  { day: 'Mon - Fri', time: '9:00 AM – 7:00 PM' },
  { day: 'Saturday', time: '9:00 AM – 5:00 PM' },
  { day: 'Sunday', time: 'Closed (Family Day)' },
];

const SocialButton = ({ icon, label }) => (
  <button
    className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white transition-all duration-300 group"
    title={label}
  >
    {icon}
  </button>
);

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] text-white font-sans relative pt-20 pb-32 overflow-hidden border-t border-slate-800">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Exotic Bulldog Legacy</h2>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Responsible French & English bulldog breeding in Alabama with health-first practices,
              transparent pedigrees, and concierge support.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialButton icon={<Instagram size={18} />} label="Instagram" />
              <SocialButton icon={<Send size={18} />} label="Telegram" />
              <SocialButton icon={<MessageCircle size={18} />} label="WhatsApp" />
            </div>
          </div>

          {/* Links Columns (2 cols each) */}
          {footerLinks.map((section, idx) => (
            <div key={idx} className="lg:col-span-2">
              <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-orange-500 transition-colors"></span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Hours & Visit (4 cols) */}
          <div className="lg:col-span-4 bg-[#151e32] rounded-3xl p-6 border border-slate-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 blur-2xl rounded-full" />

            <div className="flex items-center gap-2 mb-6">
              <Clock size={18} className="text-orange-400" />
              <h3 className="font-bold">Kennel Hours (Central Time)</h3>
            </div>

            <div className="space-y-3 text-sm mb-6">
              {hours.map((h, i) => (
                <div
                  key={i}
                  className="flex justify-between text-slate-400 border-b border-slate-800/50 pb-2 last:border-0"
                >
                  <span>{h.day}</span>
                  <span className={h.time.includes('Closed') ? 'text-slate-600' : 'text-white'}>
                    {h.time}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full bg-[#0B1120] hover:bg-slate-800 border border-slate-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              Schedule a Visit <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* --- Map Section --- */}
        <div className="relative h-64 md:h-80 rounded-[2rem] overflow-hidden border border-slate-800 group">
          {/* Map Image Placeholder (Replace with actual Google Maps Embed or Image) */}
          <img
            src="https://media.wired.com/photos/59269cd37034dc5f91becd50/master/pass/GoogleMapTA.jpg"
            alt="Location Map"
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 grayscale group-hover:grayscale-0"
          />

          {/* Overlay Card */}
          <div className="absolute bottom-6 left-6 bg-[#0B1120]/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-xs">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 p-2 rounded-lg text-white">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white">Falkville, AL</h4>
                <p className="text-xs text-slate-400 mt-1 mb-3">34°17'56.9"N 86°53'50.3"W</p>
                <a
                  href="#"
                  className="text-xs font-bold text-orange-400 flex items-center gap-1 hover:underline"
                >
                  Get Directions <Navigation size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2025 Exotic Bulldog Legacy. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-300">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-300">
              Sitemap
            </a>
          </div>
        </div>
      </div>

      {/* --- Sticky Action Bar (Floating) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl">
        <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-slate-600/50 rounded-full p-2 shadow-2xl flex items-center justify-between pl-6">
          <span className="text-sm font-medium text-slate-300 hidden sm:block">Questions?</span>

          <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
            <a
              href="#"
              className="px-4 py-2 rounded-full hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors font-medium flex items-center gap-2"
            >
              <Phone size={16} /> <span className="hidden md:inline">Call</span>
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-full hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors font-medium flex items-center gap-2"
            >
              <MessageCircle size={16} /> <span className="hidden md:inline">Text</span>
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-full hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors font-medium flex items-center gap-2"
            >
              <Mail size={16} /> <span className="hidden md:inline">Email</span>
            </a>

            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all ml-2">
              Let's Connect
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
