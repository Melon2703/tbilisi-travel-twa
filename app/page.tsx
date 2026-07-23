import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllRoutes, getRouteDurationFormatted, formatAccessibilityLabel } from '@/lib/data/routes';

export default function Home() {
  const routes = getAllRoutes();

  return (
    <div className="min-h-screen w-full bg-twa-bg text-twa-text dark:bg-stone-950 dark:text-stone-100 overflow-x-hidden antialiased">
      {/* Header / Hero Section */}
      <header className="border-b border-neutral-border dark:border-stone-800 bg-white dark:bg-stone-900/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="Georgia Flag">
              🇬🇪
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-tbilisi-slate dark:text-stone-50">
                Tbilisi Travel Routes
              </h1>
              <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                Curated Telegram WebApp Guides
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-900 text-white dark:bg-stone-800 dark:text-stone-100 border border-stone-700">
            {routes.length} Curated Routes
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8 overflow-hidden">
        {/* Intro Hero Banner */}
        <section className="bg-gradient-to-br from-stone-900 via-tbilisi-slate to-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden border border-stone-800">
          <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-terracotta/25 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-terracotta text-white uppercase tracking-wider shadow-xs">
              ✨ Interactive Catalog
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Explore Tbilisi on Foot with Local Knowledge
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Pick a route below for step-by-step navigation, timing advice, Olya&apos;s personal recommendations, and logistics notes for steep hills or cobblestone alleys.
            </p>
          </div>
        </section>

        {/* Route Cards Catalog Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-tbilisi-slate dark:text-stone-100">
              Curated Routes Catalog
            </h2>
            <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
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
                  className="group flex flex-col bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-neutral-border dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.99]"
                >
                  {/* Hero Card Image */}
                  <div className="relative w-full h-48 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    {route.heroImage && (
                      <Image
                        src={route.heroImage}
                        alt={route.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className="bg-terracotta text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider">
                        {route.durationCategory}
                      </span>
                      <span className="bg-stone-900/90 text-stone-100 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-xs">
                        {accessibilityText}
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-tbilisi-slate dark:text-stone-50 group-hover:text-terracotta dark:group-hover:text-orange-400 transition-colors leading-snug">
                        {route.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                        {route.subtitle}
                      </p>
                    </div>

                    {/* Vibes Row */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {route.vibes.map((vibe) => (
                        <span
                          key={vibe}
                          className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-700/80"
                        >
                          #{vibe}
                        </span>
                      ))}
                    </div>

                    {/* Card Footer Meta & CTA */}
                    <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          📍 <span>{route.stops.length} stops</span>
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ <span>{formattedTime}</span>
                        </span>
                      </div>
                      <span className="text-terracotta dark:text-orange-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold min-h-[44px] flex items-center">
                        View ➔
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
      <footer className="border-t border-neutral-border dark:border-stone-800 py-6 mt-12 text-center text-xs text-stone-600 dark:text-stone-400">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-stone-800 dark:text-stone-200">
            Tbilisi Travel Guide — Telegram WebApp
          </p>
          <p>© {new Date().getFullYear()} Olya&apos;s Curated Tbilisi Routes</p>
        </div>
      </footer>
    </div>
  );
}


