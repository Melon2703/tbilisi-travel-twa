import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StopCard from '../components/StopCard';
import { Stop } from '../lib/types/route';
import { LanguageProvider } from '../lib/i18n/LanguageContext';

describe('StopCard Data Enrichment & Tailored Type Rendering', () => {
  const attractionStop: Stop = {
    id: 'test-attraction-1',
    order: 1,
    stopType: 'attraction',
    name: 'Freedom Square',
    nameRu: 'Площадь Свободы',
    neighborhood: 'Center',
    neighborhoodRu: 'Центр',
    coordinates: { lat: 41.6934, lng: 44.8015 },
    estimatedMinutes: 15,
    imageUrl: 'https://images.unsplash.com/photo-1555246050-8957960659b4?auto=format&fit=crop&w=800&q=80',
    historicalSummary: 'Built in the 19th century as Erivansky Square.',
    historicalSummaryRu: 'Заложенная в XIX века как Эриванская площадь.',
    funFact: 'Site of the 1907 Tiflis bank robbery.',
    funFactRu: 'Место Тифлисского ограбления 1907 года.',
    workingHours: 'Open 24/7',
    workingHoursRu: 'Открыто круглосуточно',
    websiteUrl: 'https://tbilisi.gov.ge',
    instagramUrl: 'https://instagram.com/tbilisi_official',
    olyaTips: 'Meet under St. George statue.',
    olyaTipsRu: 'Встречаемся под статуей Св. Георгия.',
    ratings: { google: { rating: 4.7, count: 8520 } },
    placeIds: { google: 'ChIJde6a4L4XREARZ6pL-v6Hw8U' },
  };

  const venueStop: Stop = {
    id: 'test-venue-1',
    order: 2,
    stopType: 'venue',
    venueDetails: {
      category: 'cafe',
      cuisines: ['georgian', 'european'],
      isVegetarianFriendly: true,
      recommendedDishes: ['Fresh tarragon pastries', 'Artisan Georgian herbal tea'],
      bookingAdvice: 'Reserve upper balcony seats.',
      bookingAdviceRu: 'Забронируйте верхний балкон.',
    },
    name: 'Café Minda',
    nameRu: 'Кафе Minda',
    neighborhood: 'Orbeliani',
    neighborhoodRu: 'Орбелиани',
    coordinates: { lat: 41.6981, lng: 44.8032 },
    estimatedMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    workingHours: '09:00 AM - 11:00 PM',
    workingHoursRu: '09:00 - 23:00',
    websiteUrl: 'https://orbelianibazaar.ge',
    instagramUrl: 'https://instagram.com/orbelianibazaar',
    olyaTips: 'Get fresh pastries & Georgian tea.',
    olyaTipsRu: 'Возьмите свежую выпечку и грузинский чай.',
    ratings: { google: { rating: 4.6, count: 430 } },
    placeIds: { google: 'ChIJ-9_5T78XREARgXpW6W04M4A' },
  };

  it('renders historical summary, fun fact, working hours, and website/instagram links for attraction stops', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={attractionStop} currentStepOrder={1} totalSteps={6} isVisited={false} />
      </LanguageProvider>
    );

    expect(screen.getByTestId('historical-summary')).toBeInTheDocument();
    expect(screen.getByText('Built in the 19th century as Erivansky Square.')).toBeInTheDocument();

    expect(screen.getByTestId('fun-fact')).toBeInTheDocument();
    expect(screen.getByText('Site of the 1907 Tiflis bank robbery.')).toBeInTheDocument();

    expect(screen.getByTestId('working-hours-badge')).toBeInTheDocument();
    expect(screen.getByText(/Open 24\/7/)).toBeInTheDocument();

    expect(screen.getByTestId('map-pills-row')).toBeInTheDocument();
    expect(screen.getByLabelText('Visit Website')).toHaveAttribute('href', 'https://tbilisi.gov.ge');
    expect(screen.getByLabelText('Visit Instagram')).toHaveAttribute('href', 'https://instagram.com/tbilisi_official');
  });

  it('renders category, cuisine, veggie friendly badge, dishes, booking advice, and website/instagram for venue stops', () => {
    render(
      <LanguageProvider initialLanguage="en">
        <StopCard stop={venueStop} currentStepOrder={2} totalSteps={6} isVisited={false} />
      </LanguageProvider>
    );

    expect(screen.getByTestId('venue-details-header')).toBeInTheDocument();
    expect(screen.getByTestId('veggie-friendly-badge')).toBeInTheDocument();
    expect(screen.getByText('Fresh tarragon pastries')).toBeInTheDocument();

    expect(screen.getByTestId('booking-advice')).toBeInTheDocument();
    expect(screen.getByText('Reserve upper balcony seats.')).toBeInTheDocument();

    expect(screen.getByTestId('map-pills-row')).toBeInTheDocument();
    expect(screen.getByLabelText('Visit Website')).toHaveAttribute('href', 'https://orbelianibazaar.ge');
    expect(screen.getByLabelText('Visit Instagram')).toHaveAttribute('href', 'https://instagram.com/orbelianibazaar');
  });

  it('localizes historical summary, fun fact, and working hours in Russian', () => {
    render(
      <LanguageProvider initialLanguage="ru">
        <StopCard stop={attractionStop} currentStepOrder={1} totalSteps={6} isVisited={false} />
      </LanguageProvider>
    );

    expect(screen.getByText('Заложенная в XIX века как Эриванская площадь.')).toBeInTheDocument();
    expect(screen.getByText('Место Тифлисского ограбления 1907 года.')).toBeInTheDocument();
    expect(screen.getByText(/Открыто круглосуточно/)).toBeInTheDocument();
  });
});
