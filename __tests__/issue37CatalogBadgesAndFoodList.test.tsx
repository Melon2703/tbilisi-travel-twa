import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RouteCatalog from '@/components/RouteCatalog';
import StopCard from '@/components/StopCard';
import { ROUTES } from '@/lib/data/routes';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { VenueStop } from '@/lib/types/route';

describe('Issue 37: Catalog Badges Refactoring & Food Items Bulleted List', () => {
  describe('Route Catalog Badges (Criteria 1 & 2)', () => {
    it('renders maximum 2 essential badges per catalog card top image', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <RouteCatalog initialRoutes={ROUTES} />
        </LanguageProvider>
      );

      const essentialBadgeContainers = screen.getAllByTestId('essential-badges');
      expect(essentialBadgeContainers.length).toBeGreaterThan(0);

      essentialBadgeContainers.forEach((container) => {
        // Essential badges: Duration and Difficulty/Accessibility only (max 2 badges)
        expect(container.children.length).toBeLessThanOrEqual(2);
      });
    });

    it('removes long rows of hashtag badges (#Cultural, #Insta-Locations) from catalog card summaries', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <RouteCatalog initialRoutes={ROUTES} />
        </LanguageProvider>
      );

      // Check that hashtags like #cultural or #insta-locations are not present inside route catalog card links
      const catalogCardLinks = screen.getAllByRole('link');
      expect(catalogCardLinks.length).toBeGreaterThan(0);

      catalogCardLinks.forEach((link) => {
        // Link text should not contain hashtag badge strings like #cultural or #insta-spots
        expect(link.textContent).not.toMatch(/#(cultural|insta-locations|courtyards|photo-spots|hiking|architecture)/i);
      });
    });
  });

  describe('StopCard Recommended Food Items List (Criteria 3 & 4)', () => {
    const mockVenueStop: VenueStop = {
      id: 'test-venue-stop',
      order: 1,
      name: 'Test Bakery & Cafe',
      stopType: 'venue',
      coordinates: { lat: 41.6938, lng: 44.8015 },
      neighborhood: 'Sololaki',
      estimatedMinutes: 30,
      olyaTips: 'Try the fresh tarragon pastries!',
      isOptional: true,
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
      venueDetails: {
        category: 'cafe',
        cuisines: ['georgian'],
        isVegetarianFriendly: true,
        recommendedDishes: ['Fresh tarragon pastries', 'Artisan Georgian tea', 'Matsoni parfait'],
        bookingAdvice: 'No booking needed',
      },
    };

    it('converts recommended food items into a vertical bulleted text list (• Item)', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={mockVenueStop} totalStops={1} />
        </LanguageProvider>
      );

      const dishesContainer = screen.getByTestId('recommended-dishes');
      expect(dishesContainer).toBeInTheDocument();

      const dishList = screen.getByTestId('recommended-dishes-list');
      expect(dishList).toBeInTheDocument();
      expect(dishList.tagName.toLowerCase()).toBe('ul');

      const dishItems = screen.getAllByTestId('dish-item');
      expect(dishItems).toHaveLength(3);

      expect(dishItems[0]).toHaveTextContent('•');
      expect(dishItems[0]).toHaveTextContent('Fresh tarragon pastries');

      expect(dishItems[1]).toHaveTextContent('•');
      expect(dishItems[1]).toHaveTextContent('Artisan Georgian tea');

      expect(dishItems[2]).toHaveTextContent('•');
      expect(dishItems[2]).toHaveTextContent('Matsoni parfait');
    });

    it('ensures food list container has zero borders and zero pill backgrounds', () => {
      render(
        <LanguageProvider initialLanguage="en">
          <StopCard stop={mockVenueStop} totalStops={1} />
        </LanguageProvider>
      );

      const dishesContainer = screen.getByTestId('recommended-dishes');
      const dishList = screen.getByTestId('recommended-dishes-list');
      const dishItems = screen.getAllByTestId('dish-item');

      // Zero borders on container and list
      expect(dishesContainer.className).toContain('border-0');
      expect(dishList.className).toContain('border-0');

      // Zero pill backgrounds
      expect(dishesContainer.className).toContain('bg-transparent');
      expect(dishList.className).toContain('bg-transparent');

      dishItems.forEach((item) => {
        expect(item.className).toContain('border-0');
        expect(item.className).toContain('bg-transparent');
        // No rounded-full pill buttons
        expect(item.className).not.toContain('rounded-full');
      });

      // Confirm no button pill elements exist within recommended dishes
      expect(screen.queryByTestId('dish-pill')).not.toBeInTheDocument();
    });
  });
});
