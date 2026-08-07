import React from 'react';
import { getAllRoutes } from '@/lib/data/routes';
import CatalogShell from '@/components/CatalogShell';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { parseLanguage } from '@/lib/i18n/languagePreference';

interface PageProps {
  searchParams?: Promise<{ lang?: string }>;
}

export default async function Home({ searchParams }: PageProps = {}) {
  const routes = getAllRoutes();
  const resolvedSearchParams = searchParams ? await searchParams : {};

  /*
    Read here as well as on a Route, so a link carrying a language renders in it rather
    than flipping after hydration. Without a parameter the provider resolves the rest of
    the order in the browser: stored preference, Telegram locale, English.
  */
  const initialLang = parseLanguage(resolvedSearchParams.lang);

  return (
    <LanguageProvider initialLanguage={initialLang}>
      <CatalogShell routes={routes} />
    </LanguageProvider>
  );
}
