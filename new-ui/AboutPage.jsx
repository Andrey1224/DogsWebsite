import React from 'react';
import {
  Heart,
  Shield,
  Award,
  Sparkles,
  Bone,
  Users,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  Star,
  Coffee,
  BookOpen,
} from 'lucide-react';

// --- Content Data ---
const stats = [
  { value: '10+', label: 'Years with bulldogs' },
  { value: '100+', label: 'Healthy placements' },
  { value: '100%', label: 'Lifetime support' },
];

const values = [
  {
    icon: <Shield className="text-orange-400" size={28} />,
    title: 'Health-first philosophy',
    desc: 'Parents are DNA-tested and OFA-screened. Every pairing reduces hereditary risks while building sound temperaments.',
  },
  {
    icon: <Sparkles className="text-purple-400" size={28} />,
    title: 'Enrichment-driven raising',
    desc: 'Early Neurological Stimulation, gentle kid exposure, and sound desensitization come standard for every pup.',
  },
  {
    icon: <Users className="text-blue-400" size={28} />,
    title: 'Lifetime breeder support',
    desc: 'We stay in touch long after pickup. Nutrition plans, training tips, and quick answers whenever you need us.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans pb-20">
      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 text-orange-400 font-bold tracking-widest text-xs uppercase mb-2">
              <span className="w-8 h-[1px] bg-orange-500"></span> Our Story
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              A boutique program built on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                trust & transparency
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              We are a small family breeder in Alabama, founded in 2019 with one goal in mind:
              raising healthy, confident, and well-balanced Bulldogs. What began with a single
              puppy who stole our hearts grew into a program shaped by intention, responsibility,
              and genuine care.
            </p>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Every pairing, every pregnancy, and every puppy is raised as if they were our own. No
              shortcuts. No guesswork. Just honest communication, ethical practices, and a
              commitment to giving each pup the strongest possible start.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 border-t border-slate-800 pt-8">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <div className="bg-[#1E293B] border-l-4 border-orange-500 p-6 rounded-r-xl italic text-slate-300">
                "Every puppy deserves a healthy start and a loving home. That is our only metric of
                success."
              </div>
            </div>
          </div>

          {/* Image Composition */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-[2.5rem] opacity-20 blur-2xl"></div>
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-700/50">
              <img
                src="https://images.unsplash.com/photo-1587402092301-725e37c70fd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Breeder holding puppy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-60"></div>

              {/* Floating Badge */}
              <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl max-w-[200px]">
                <div className="flex items-center gap-2 text-white font-bold mb-1">
                  <Award className="text-yellow-400" size={20} />
                  <span>Award Winning</span>
                </div>
                <p className="text-xs text-slate-200">
                  Recognized for excellence in temperament and health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- VALUES SECTION --- */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#151e32] p-8 rounded-3xl border border-slate-800 hover:border-orange-500/30 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-[#0B1120] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- BREED SPOTLIGHT: FRENCHIE --- */}
      <section className="py-24 bg-[#0f1629] relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="order-2 lg:order-1 relative">
            <div className="aspect-square rounded-[3rem] overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-700/50">
              <img
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="French Bulldog"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <div className="inline-block bg-purple-500/10 text-purple-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              The Entertainer
            </div>
            <h2 className="text-4xl font-bold mb-6">
              French Bulldog: <br />
              The Square Flask of Joy
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Not just a dog, but a certified style icon with a perpetually serious, yet incredibly
              endearing facial expression. You aren't just acquiring a pet; you are investing in a
              24/7 source of positive energy.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 bg-purple-500/20 p-2 rounded-lg h-fit">
                  <Star size={20} className="text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Master of the Comedic Glare</h4>
                  <p className="text-slate-400 text-sm mt-1">
                    Their big, dark eyes can melt your heart in a second. They ask for cheese
                    without uttering a sound.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-purple-500/20 p-2 rounded-lg h-fit">
                  <Bone size={20} className="text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Compact Comfort Energy</h4>
                  <p className="text-slate-400 text-sm mt-1">
                    Always ready to be close—on your bed, or right on your head. A living, warm,
                    slightly snorting anti-stress ball.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BREED SPOTLIGHT: ENGLISH BULLDOG --- */}
      <section className="py-24 bg-[#0B1120] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="inline-block bg-orange-500/10 text-orange-400 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2">
              🇬🇧 The Classic
            </div>
            <h2 className="text-4xl font-bold">
              English Bulldog: <br />
              Your Wrinkly Cloud of Happiness
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              A majestic creature whose rough, gladiator-like appearance conceals the soul of a
              gentle, devoted teddy bear. The king of low-effort, deep companionship.
            </p>

            <div className="bg-[#1E293B]/50 rounded-2xl p-6 border border-slate-800 space-y-4">
              <h4 className="font-bold text-white border-b border-slate-700 pb-2 mb-4">
                Perfect Partner For:
              </h4>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-200 block">Movie Nights</span>
                  <span className="text-xs text-slate-500">
                    His contented sighing creates the cozy atmosphere.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <BookOpen size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-200 block">Reading Books</span>
                  <span className="text-xs text-slate-500">
                    A heavy, warm, stabilizing anchor on your lap.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Coffee size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-200 block">Quiet Walks</span>
                  <span className="text-xs text-slate-500">
                    He doesn't need speed; he just needs your presence.
                  </span>
                </div>
              </div>
            </div>

            <p className="italic text-slate-500 text-sm border-l-2 border-slate-700 pl-4">
              "The English Bulldog is a steady stream of positivity. He is your pillow, space
              heater, and therapist."
            </p>
          </div>

          {/* Image Side */}
          <div className="relative">
            <div className="aspect-square rounded-[3rem] overflow-hidden -rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-700/50 shadow-2xl shadow-black/50">
              <img
                src="https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="English Bulldog"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decor Elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Ready to add a "Cloud of Happiness" to your life?
          </h2>
          <p className="text-slate-400 mb-8">
            We welcome families by appointment in Montgomery, AL and host virtual meet-and-greets.
          </p>
          <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-10 rounded-full hover:scale-105 transition-transform shadow-lg shadow-orange-500/25 flex items-center gap-2 mx-auto">
            See available puppies <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
