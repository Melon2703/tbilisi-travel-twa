import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--warm-stone)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[var(--warm-stone)] text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-[var(--terracotta)] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          📍
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--tbilisi-slate)]">
          Route Not Found
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Sorry, Olya couldn&apos;t find the requested walking route. It may have been moved or removed.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[var(--terracotta)] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
