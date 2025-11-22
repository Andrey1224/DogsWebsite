import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Star, MapPin, Facebook } from 'lucide-react';

const reviews = [
{
id: 1,
name: "Sarah W.",
location: "Huntsville, AL",
date: "Visited June 2025",
title: "Healthiest puppy ever",
text: "We picked up our puppy last week and the experience was flawless. The vet said he creates the standard for the breed. Highly recommend!",
img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
rating: 5
},
{
id: 2,
name: "Natalie C.",
location: "Mobile, AL",
date: "Visited August 2025",
title: "Second bulldog from EBL",
text: "We adopted our second bulldog from EBL. Both puppies came home healthy and social. Payment and pickup were simple. The absolute best family to work with.",
img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
rating: 5
},
{
id: 3,
name: "James R.",
location: "Birmingham, AL",
date: "Visited Sept 2025",
title: "Amazing Temperament",
text: "Whatever they are doing raising these pups, it works. Our little guy is so calm and loving with our kids. Worth every penny.",
img: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
rating: 5
}
];

export default function ImprovedCarousel() {
const [currentIndex, setCurrentIndex] = useState(1); // Start at center for demo

const nextSlide = () => {
setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
};

const prevSlide = () => {
setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
};

return (
<div className="min-h-screen bg-[#1a2238] text-white py-20 overflow-hidden font-sans">
<div className="max-w-6xl mx-auto px-4">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h3 className="text-orange-400 font-bold tracking-wider text-sm mb-2 uppercase">
              Featured Raves
            </h3>
            <h2 className="text-4xl font-bold text-white mb-4">
              Families who love their bulldogs
            </h2>
            <p className="text-slate-400 max-w-lg">
              Curated highlights from published reviews. We rotate fresh stories from the community as they get approved.
            </p>
          </div>

          {/* Navigation Buttons - Moved to Header for better UX */}
          <div className="flex gap-4 mt-6 md:mt-0">
             <button
              onClick={prevSlide}
              className="p-3 rounded-full border border-slate-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-colors duration-300 text-slate-400"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-full border border-slate-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-colors duration-300 text-slate-400"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Section */}
        <div className="relative h-[500px] flex items-center justify-center">
          <div className="absolute w-full flex justify-center items-center perspective-1000">
            {reviews.map((review, index) => {
              // Calculate position relative to current index
              let position = index - currentIndex;

              // Handle wrap-around logic logic roughly for 3 items demo
              if (currentIndex === 0 && index === reviews.length - 1) position = -1;
              if (currentIndex === reviews.length - 1 && index === 0) position = 1;

              const isActive = position === 0;
              const isPrev = position === -1;
              const isNext = position === 1;

              // Hide others for this simple 3-card demo
              if (!isActive && !isPrev && !isNext) return null;

              return (
                <div
                  key={review.id}
                  className={`
                    absolute transition-all duration-500 ease-out
                    w-[90%] md:w-[600px] rounded-2xl p-6 shadow-2xl
                    border border-slate-700/50
                    ${isActive
                      ? 'z-20 scale-100 opacity-100 bg-[#232d4b] translate-x-0 blur-0'
                      : 'z-10 scale-90 opacity-40 bg-[#1a2238] blur-[1px]'
                    }
                    ${isPrev ? '-translate-x-[15%] md:-translate-x-[55%]' : ''}
                    ${isNext ? 'translate-x-[15%] md:translate-x-[55%]' : ''}
                  `}
                  style={{
                    boxShadow: isActive ? '0 20px 50px -12px rgba(0, 0, 0, 0.5)' : 'none'
                  }}
                >
                  {/* Header: User Info */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      {/* Avatar placeholder if needed, or just text */}
                      <div>
                        <h4 className="font-bold text-lg text-white">{review.name}</h4>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                          <MapPin size={12} />
                          <span>{review.location}</span>
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">{review.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-orange-400 text-orange-400" />
                        ))}
                       </div>
                       <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 uppercase tracking-wider">
                         From Facebook <Facebook size={10} />
                       </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 text-white">{review.title}</h3>
                  <p className="text-slate-300 leading-relaxed mb-6 text-sm md:text-base">
                    "{review.text}"
                  </p>

                  {/* Image Banner */}
                  <div className="h-32 md:h-40 w-full rounded-xl overflow-hidden relative">
                    <img
                      src={review.img}
                      alt="Puppy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#232d4b]/80 to-transparent opacity-60"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile indicators */}
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? 'w-8 bg-orange-500' : 'w-2 bg-slate-600'
              }`}
            />
          ))}
        </div>

      </div>
    </div>

);
}
