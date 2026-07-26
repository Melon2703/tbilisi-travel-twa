import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmojiIcon, { EMOJI_ICONS } from '@/components/ui/EmojiIcon';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Callout from '@/components/ui/Callout';

describe('Common UI Components & Emoji System', () => {
  describe('EmojiIcon Component', () => {
    it('renders the correct emoji for valid icon names', () => {
      render(<EmojiIcon name="mapPin" data-testid="map-pin-emoji" />);
      const element = screen.getByTestId('map-pin-emoji');
      expect(element).toBeInTheDocument();
      expect(element.textContent).toBe('📍');
    });

    it('renders fallback or direct emoji when raw string is passed', () => {
      render(<EmojiIcon name="🚶" data-testid="raw-emoji" />);
      const element = screen.getByTestId('raw-emoji');
      expect(element.textContent).toBe('🚶');
    });

    it('supports aria-hidden by default for visual icons', () => {
      render(<EmojiIcon name="clock" data-testid="clock-emoji" />);
      const element = screen.getByTestId('clock-emoji');
      expect(element).toHaveAttribute('aria-hidden', 'true');
    });

    it('defines all required application icon mappings', () => {
      expect(EMOJI_ICONS.mapPin).toBe('📍');
      expect(EMOJI_ICONS.footprints).toBe('🚶');
      expect(EMOJI_ICONS.funicular).toBe('🚠');
      expect(EMOJI_ICONS.clock).toBe('⏱️');
      expect(EMOJI_ICONS.chat).toBe('💬');
      expect(EMOJI_ICONS.camera).toBe('📸');
      expect(EMOJI_ICONS.warning).toBe('⚠️');
      expect(EMOJI_ICONS.arrowRight).toBe('➡️');
      expect(EMOJI_ICONS.check).toBe('✅');
      expect(EMOJI_ICONS.close).toBe('✖️');
      expect(EMOJI_ICONS.googleMaps).toBe('🗺️');
      expect(EMOJI_ICONS.appleMaps).toBe('🍏');
      expect(EMOJI_ICONS.yandexMaps).toBe('🔴');
      expect(EMOJI_ICONS.star).toBe('⭐');
    });
  });

  describe('Card Component', () => {
    it('renders card with children and custom class names', () => {
      render(
        <Card className="custom-card-class">
          <p>Card Content</p>
        </Card>
      );
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      const card = screen.getByText('Card Content').parentElement;
      expect(card).toHaveClass('custom-card-class');
    });
  });

  describe('Badge Component', () => {
    it('renders badge with correct variant styles', () => {
      render(<Badge variant="terracotta">1-2h</Badge>);
      expect(screen.getByText('1-2h')).toBeInTheDocument();
    });
  });

  describe('Button Component', () => {
    it('renders CTA button with emoji icon and label', () => {
      render(
        <Button emoji="arrowRight">
          Start Route
        </Button>
      );
      expect(screen.getByRole('button')).toHaveTextContent('Start Route');
      expect(screen.getByRole('button')).toHaveTextContent('➡️');
    });
  });

  describe('Callout Component', () => {
    it('renders callout header with icon and title', () => {
      render(
        <Callout emoji="chat" title="Olya's Tip">
          Great view of the city!
        </Callout>
      );
      expect(screen.getByText("Olya's Tip")).toBeInTheDocument();
      expect(screen.getByText('💬')).toBeInTheDocument();
      expect(screen.getByText('Great view of the city!')).toBeInTheDocument();
    });
  });
});
