import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import { getRouteById } from '@/lib/data/routes';
import StopCard from '@/components/StopCard';

interface PageProps {
  params: Promise<{ routeId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { routeId } = await params;
  const route = getRouteById(routeId);

  if (!route) {
    return {
      title: 'Route Not Found | Tbilisi Travel Guide',
    };
  }

  return {
    title: `${route.title} | Tbilisi Travel Guide`,
    description: route.subtitle,
  };
}

export default async function RoutePage({ params }: PageProps) {
  const { routeId } = await params;
  const route = getRouteById(routeId);

  if (!route) {
    notFound();
  }

  const sortedStops = [...route.stops].sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-[var(--twa-bg-color,#f7f4ef)] text-[var(--twa-text-color,#1f2421)] antialiased">
      {/* Route Hero Header */}
      <header className="relative bg-[var(--tbilisi-slate)] text-white overflow-hidden pb-8 pt-6 px-4 sm:px-6 shadow-md">
        {route.heroImage && (
          <div className="absolute inset-0 z-0 opacity-25">
            <Image
              src={route.heroImage}
              alt={route.title}
              fill
              priority
              className="w-full h-full object-cover filter blur-xs scale-105"
            />
          </div>
        )}
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="bg-[var(--terracotta)] text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
              {route.durationCategory}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
              {route.accessibility}
            </span>
            {route.vibes.map((vibe) => (
              <span
                key={vibe}
                className="bg-white/10 backdrop-blur-md text-white/90 px-2.5 py-1 rounded-full capitalize"
              >
                #{vibe}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {route.title}
          </h1>

          <p className="text-sm sm:text-base text-gray-200 font-medium">
            {route.subtitle}
          </p>

          {route.introCopy && (
            <p className="text-xs sm:text-sm text-gray-300 pt-2 border-t border-white/15 leading-relaxed">
              {route.introCopy}
            </p>
          )}
        </div>
      </header>

      {/* Timeline Section */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--tbilisi-slate)] uppercase tracking-wider">
            Route Timeline ({sortedStops.length} Stops)
          </h2>
        </div>

        {/* Vertical Feed of Cards */}
        <div className="space-y-2">
          {sortedStops.map((stop, index) => (
            <StopCard
              key={stop.id}
              stop={stop}
              isLast={index === sortedStops.length - 1}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
