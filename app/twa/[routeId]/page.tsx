import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getRouteById } from '@/lib/data/routes';
import TelegramBackButtonController from '@/components/TelegramBackButtonController';
import RouteCarousel from '@/components/RouteCarousel';

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

  return (
    <main className="min-h-screen bg-[var(--twa-bg-color,#f7f4ef)] text-[var(--twa-text-color,#1f2421)] antialiased">
      <TelegramBackButtonController />
      <RouteCarousel route={route} />
    </main>
  );
}
