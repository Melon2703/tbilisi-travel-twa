import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

  it('renders route details including duration, accessibility, stop count, and vibes', () => {
    render(<Home />);

    const firstRoute = ROUTES[0];
    
    // Title & subtitle
    expect(screen.getByText(firstRoute.title)).toBeInTheDocument();
    expect(screen.getByText(firstRoute.subtitle)).toBeInTheDocument();

    // Duration category
    expect(screen.getAllByText(new RegExp(firstRoute.durationCategory, 'i')).length).toBeGreaterThan(0);

    // Stop count
    expect(screen.getAllByText(new RegExp(`${firstRoute.stops.length}\\s*stops`, 'i')).length).toBeGreaterThan(0);

    // Vibe tags
    firstRoute.vibes.forEach((vibe) => {
      expect(screen.getAllByText(new RegExp(`#?${vibe}`, 'i')).length).toBeGreaterThan(0);
    });
  });

  it('renders links to /twa/[routeId] for every route', () => {
    render(<Home />);

    ROUTES.forEach((route) => {
      const link = screen.getByRole('link', { name: new RegExp(route.title, 'i') });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `/twa/${route.id}`);
    });
  });
});
