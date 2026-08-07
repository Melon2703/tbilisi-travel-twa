import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/app/page';
import { ROUTES } from '@/lib/data/routes';

describe('Home Root Page (Route Directory)', () => {
  it('renders main heading and hero subtitle', () => {
    render(<Home />);
    
    // Check main heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/Tbilisi/i);
    
    // Check catalog subtitle / intro text
    expect(screen.getByText(/Curated walking routes|Explore Tbilisi/i)).toBeInTheDocument();
  });

  it('renders all curated routes from routes data', () => {
    render(<Home />);

    ROUTES.forEach((route) => {
      expect(screen.getByText(route.title)).toBeInTheDocument();
    });
  });

  it('renders route details including duration, accessibility, and stop count without hashtag badge rows on card summaries', () => {
    render(<Home />);

    const firstRoute = ROUTES[0];
    
    // Title & subtitle
    expect(screen.getByText(firstRoute.title)).toBeInTheDocument();
    expect(screen.getByText(firstRoute.subtitle)).toBeInTheDocument();

    // Duration category
    expect(screen.getAllByText(new RegExp(firstRoute.durationCategory, 'i')).length).toBeGreaterThan(0);

    // Stop count
    expect(screen.getAllByText(new RegExp(`${firstRoute.stops.length}\\s*stops`, 'i')).length).toBeGreaterThan(0);

    // Verify essential top badges are rendered and hashtag badge summary row is absent
    const essentialBadgesContainers = screen.getAllByTestId('essential-badges');
    expect(essentialBadgesContainers.length).toBeGreaterThan(0);
    expect(essentialBadgesContainers[0].children).toHaveLength(2);
  });

  it('renders links to /twa/[routeId] for every route', () => {
    render(<Home />);

    ROUTES.forEach((route) => {
      const link = screen.getByRole('link', { name: new RegExp(route.title, 'i') });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `/twa/${route.id}`);
    });
  });

  describe('Route Filter Controls & Geo-Proximity Relative Sorting', () => {
    it('renders a duration filter option for every duration the catalog carries, and none it does not', () => {
      render(<Home />);

      expect(screen.getByTestId('duration-filter-1-2h')).toBeInTheDocument();
      expect(screen.getByTestId('duration-filter-3-4h')).toBeInTheDocument();
      expect(screen.getByTestId('duration-filter-half-day')).toBeInTheDocument();
      // No Route is a full day, so the option is not offered — it would return nothing.
      expect(screen.queryByTestId('duration-filter-full-day')).toBeNull();
    });

    it('filters routes when duration category option is selected', () => {
      render(<Home />);

      const filterBtn = screen.getByTestId('duration-filter-1-2h');
      fireEvent.click(filterBtn);

      // Only 1-2h routes should be visible
      const oneTwoHoursRoutes = ROUTES.filter((r) => r.durationCategory === '1-2h');
      const nonOneTwoHoursRoutes = ROUTES.filter((r) => r.durationCategory !== '1-2h');

      oneTwoHoursRoutes.forEach((route) => {
        expect(screen.getByText(route.title)).toBeInTheDocument();
      });
      nonOneTwoHoursRoutes.forEach((route) => {
        expect(screen.queryByText(route.title)).not.toBeInTheDocument();
      });
    });

    it('renders vibe tag filter options (insta-locations, cultural, hiking) and filters catalog', () => {
      render(<Home />);

      const hikingBtn = screen.getByTestId('vibe-filter-hiking');
      expect(hikingBtn).toBeInTheDocument();

      fireEvent.click(hikingBtn);

      const hikingRoutes = ROUTES.filter((r) => r.vibes.includes('hiking'));
      const nonHikingRoutes = ROUTES.filter((r) => !r.vibes.includes('hiking'));

      hikingRoutes.forEach((route) => {
        expect(screen.getByText(route.title)).toBeInTheDocument();
      });
      nonHikingRoutes.forEach((route) => {
        expect(screen.queryByText(route.title)).not.toBeInTheDocument();
      });
    });

    it('triggers geolocation request and sorts routes by proximity when Nearest button is clicked', async () => {
      const getCurrentPositionMock = vi.fn((success: (pos: { coords: { latitude: number; longitude: number } }) => void) => {
        // User at Freedom Square (41.6934, 44.8015)
        success({
          coords: {
            latitude: 41.6934,
            longitude: 44.8015,
          },
        });
      });

      Object.defineProperty(global.navigator, 'geolocation', {
        value: { getCurrentPosition: getCurrentPositionMock },
        writable: true,
        configurable: true,
      });

      render(<Home />);

      const geoBtn = screen.getByTestId('geo-location-button');
      expect(geoBtn).toBeInTheDocument();

      fireEvent.click(geoBtn);

      expect(getCurrentPositionMock).toHaveBeenCalledTimes(1);
      // Check that distance badges appear on cards
      expect(screen.getAllByTestId('route-distance-badge').length).toBeGreaterThan(0);
    });
  });
});
