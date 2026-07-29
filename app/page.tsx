import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllRoutes } from '@/lib/data/routes';
import RouteCatalog from '@/components/RouteCatalog';

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

        {/* Route Cards Catalog Grid & Filter Controls */}
        <section className="space-y-4">
          <RouteCatalog initialRoutes={routes} />
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
