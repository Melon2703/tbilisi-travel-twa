import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllRoutes, getRouteDurationFormatted, formatAccessibilityLabel } from '@/lib/data/routes';
import EmojiIcon from '@/components/ui/EmojiIcon';
import GeorgianOrnament from '@/components/ui/GeorgianOrnament';

export default function Home() {
  const routes = getAllRoutes();

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#1C1008] overflow-x-hidden antialiased font-sans">
      {/* Header / Hero Section */}
      <header className="border-b border-[#C4572A]/15 bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="Georgia Flag">
              🇬🇪
            </span>
            <div>
              <h1
                className="text-lg sm:text-xl font-black tracking-tight text-[#1C1008]"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Tbilisi Travel Routes
              </h1>
              <p className="text-xs text-[#7A6552] font-medium">
                Curated Telegram WebApp Guides
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#C4572A] text-white border border-[#C4572A] shadow-xs">
            {routes.length} Curated Routes
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8 overflow-hidden">
        {/* Intro Hero Banner */}
        <section
          className="rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden text-[#1C1008]"
          style={{
            background: '#FFF8F3',
            border: '1px solid rgba(196,87,42,0.18)',
          }}
        >
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-xs"
              style={{ background: '#C4572A' }}
            >
              ✨ Interactive Catalog
            </div>
            <h2
              className="text-2xl sm:text-4xl font-black tracking-tight text-[#1C1008] leading-tight"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Explore Tbilisi on Foot with Local Knowledge
            </h2>
            <p className="text-[#7A6552] text-sm sm:text-base leading-relaxed">
              Pick a route below for step-by-step navigation, timing advice, Olya&apos;s personal recommendations, and logistics notes for steep hills or cobblestone alleys.
            </p>

          </div>
        </section>

        {/* Route Cards Catalog Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-black tracking-tight text-[#1C1008]"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Curated Routes Catalog
            </h2>
            <span className="text-xs text-[#7A6552] font-medium">
              Tap any card to view timeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => {
              const formattedTime = getRouteDurationFormatted(route);
              const accessibilityText = formatAccessibilityLabel(route.accessibility);

              return (
                <Link
                  key={route.id}
                  href={`/twa/${route.id}`}
                  className="group flex flex-col bg-[#FFF8F3] rounded-2xl overflow-hidden border border-[#C4572A]/15 shadow-xs hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4572A] active:scale-[0.99]"
                >
                  {/* Hero Card Image */}
                  <div className="relative w-full h-48 bg-[#FAF7F2] overflow-hidden">
                    {route.heroImage && (
                      <Image
                        src={route.heroImage}
                        alt={route.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span
                        className="text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider"
                        style={{ background: '#C4572A' }}
                      >
                        {route.durationCategory}
                      </span>
                      <span className="bg-black/60 text-[#FAF7F2] text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-xs">
                        {accessibilityText}
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3
                        className="text-lg font-black text-[#1C1008] group-hover:text-[#C4572A] transition-colors leading-snug"
                        style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                      >
                        {route.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#7A6552] leading-relaxed">
                        {route.subtitle}
                      </p>
                    </div>

                    <GeorgianOrnament />

                    {/* Vibes Row */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {route.vibes.map((vibe) => (
                        <span
                          key={vibe}
                          className="bg-[#FAF7F2] text-[#7A6552] text-[11px] font-semibold px-2.5 py-1 rounded-md border border-[#C4572A]/15 capitalize"
                        >
                          #{vibe}
                        </span>
                      ))}
                    </div>

                    {/* Card Footer Meta & CTA */}
                    <div className="pt-3 border-t border-[#C4572A]/12 flex items-center justify-between text-xs font-semibold text-[#7A6552]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <EmojiIcon name="mapPin" size="xs" /> <span className="text-[#1C1008] font-bold">{route.stops.length} stops</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <EmojiIcon name="clock" size="xs" /> <span className="text-[#1C1008] font-bold">{formattedTime}</span>
                        </span>
                      </div>
                      <span className="text-[#C4572A] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold min-h-[44px]">
                        View <EmojiIcon name="arrowRight" size="xs" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* Page Footer */}
      <footer className="border-t border-[#C4572A]/15 py-6 mt-12 text-center text-xs text-[#7A6552]">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-[#1C1008]">
            Tbilisi Travel Guide — Telegram WebApp
          </p>
          <p>© {new Date().getFullYear()} Olya&apos;s Curated Tbilisi Routes</p>
        </div>
      </footer>
    </div>
  );
}
