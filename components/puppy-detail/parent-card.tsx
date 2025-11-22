import Image from 'next/image';
import { Activity, Quote, Star, Weight } from 'lucide-react';

import { resolveLocalImage } from '@/lib/utils/images';

type ParentStat = {
  label: string;
  value: string;
  icon: typeof Weight | typeof Star | typeof Activity;
};

type ParentCardProps = {
  role: 'sire' | 'dam';
  name: string;
  photoUrl: string | null;
  title?: string | null;
  stats?: ParentStat[];
  quote?: string | null;
};

const roleLabels = {
  sire: { text: 'The Sire (Father)', badgeClass: 'text-orange-400', quoteClass: 'text-orange-500' },
  dam: { text: 'The Dam (Mother)', badgeClass: 'text-pink-400', quoteClass: 'text-pink-500' },
};

export function ParentCard({ role, name, photoUrl, title, stats = [], quote }: ParentCardProps) {
  const resolvedImage = resolveLocalImage(photoUrl, '/parent-placeholder.jpg');
  const { text: roleText, badgeClass, quoteClass } = roleLabels[role];

  return (
    <div className="space-y-6">
      <div className="group relative h-80 overflow-hidden rounded-[2rem] border border-slate-800 shadow-2xl">
        <Image
          src={resolvedImage}
          alt={`${name} - ${roleText}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/20 to-transparent" />

        {/* Text Content */}
        <div className="absolute bottom-0 left-0 p-8">
          <div
            className={`mb-2 w-fit rounded-full bg-black/50 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${badgeClass}`}
          >
            {roleText}
          </div>
          <h3 className="mb-1 text-4xl font-bold text-white">{name}</h3>
          {title && <p className="text-sm font-medium text-slate-300">{title}</p>}
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={`${stat.label}-${stat.value}`}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#151e32] p-3"
              >
                <Icon size={16} className="text-slate-500" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </div>
                  <div className="text-sm font-semibold text-white">{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {quote ? (
        <div className="flex gap-3 rounded-2xl border border-slate-800/50 bg-[#1E293B]/30 p-5">
          <Quote className={quoteClass} size={20} />
          <p className="text-sm italic leading-relaxed text-slate-400">“{quote}”</p>
        </div>
      ) : null}
    </div>
  );
}
