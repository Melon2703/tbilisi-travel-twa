import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getRouteById } from '@/lib/data/routes';
import TelegramBackButtonController from '@/components/TelegramBackButtonController';
import RouteCarousel from '@/components/RouteCarousel';
import { FIRST_RESUMABLE_POSITION } from '@/lib/utils/progress';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { Language } from '@/lib/i18n/types';

interface PageProps {
  params: Promise<{ routeId: string }>;
  searchParams?: Promise<{ lang?: string; at?: string }>;
}

/**
 * `at` carries the Card the catalog's Continue affordance resumes at. It is a
 * traveler-editable URL, so anything that is not a Stop slide opens the Route
 * Intro Card.
 */
function parseEntryPosition(at?: string): number | undefined {
  const position = Number(at);
  return Number.isInteger(position) && position >= FIRST_RESUMABLE_POSITION ? position : undefined;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { routeId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const lang = resolvedSearchParams.lang;
  const route = getRouteById(routeId);

  if (!route) {
    return {
      title: 'Route Not Found | Tbilisi Travel Guide',
    };
  }

  const isRu = lang === 'ru';
  const title = isRu && route.titleRu ? route.titleRu : route.title;
  const description = isRu && route.subtitleRu ? route.subtitleRu : route.subtitle;

  return {
    title: `${title} | Tbilisi Travel Guide`,
    description,
  };
}

export default async function RoutePage({ params, searchParams }: PageProps) {
  const { routeId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const lang = resolvedSearchParams.lang;
  const route = getRouteById(routeId);

  if (!route) {
    notFound();
  }

  const initialLang: Language = lang === 'ru' ? 'ru' : 'en';

  return (
    <main className="min-h-screen bg-[var(--twa-bg-color,#f7f4ef)] text-[var(--twa-text-color,#1f2421)] antialiased">
      <LanguageProvider initialLanguage={initialLang}>
        <RouteCarousel
          route={route}
          entryProgressPosition={parseEntryPosition(resolvedSearchParams.at)}
        />
      </LanguageProvider>
    </main>
  );
}
