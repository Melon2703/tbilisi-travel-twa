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
    it('draws a real icon glyph, not an emoji character', () => {
      render(<EmojiIcon name="mapPin" data-testid="map-pin-icon" />);
      const element = screen.getByTestId('map-pin-icon');
      expect(element).toBeInTheDocument();
      expect(element.querySelector('svg')).toBeInTheDocument();
      expect(element.textContent).toBe('');
    });

    it('draws a distinct glyph for each name', () => {
      render(
        <>
          <EmojiIcon name="mapPin" data-testid="a" />
          <EmojiIcon name="clock" data-testid="b" />
        </>
      );
      expect(screen.getByTestId('a').innerHTML).not.toBe(
        screen.getByTestId('b').innerHTML
      );
    });

    it('writes no text of its own — a name always resolves to a drawn glyph', () => {
      render(<EmojiIcon name="mapPin" data-testid="drawn" />);
      const element = screen.getByTestId('drawn');
      expect(element.querySelector('svg')).not.toBeNull();
      expect(element.textContent).toBe('');
    });

    it('supports aria-hidden by default for visual icons', () => {
      render(<EmojiIcon name="clock" data-testid="clock-icon" />);
      const element = screen.getByTestId('clock-icon');
      expect(element).toHaveAttribute('aria-hidden', 'true');
      expect(element.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('exposes an accessible label when one is given', () => {
      render(<EmojiIcon name="star" ariaLabel="Rating" data-testid="star-icon" />);
      const element = screen.getByTestId('star-icon');
      expect(element).toHaveAttribute('role', 'img');
      expect(element).toHaveAttribute('aria-label', 'Rating');
      expect(element).not.toHaveAttribute('aria-hidden');
    });

    it('inherits currentColor and sizes from the text scale', () => {
      render(<EmojiIcon name="star" size="lg" data-testid="star-icon" />);
      const element = screen.getByTestId('star-icon');
      expect(element).toHaveClass('text-lg');
      const svg = element.querySelector('svg')!;
      // Line icons paint with stroke, solid ones with fill — either way the
      // colour comes from the surrounding text, never from the icon itself.
      expect([svg.getAttribute('stroke'), svg.getAttribute('fill')]).toContain(
        'currentColor'
      );
      expect(svg).toHaveAttribute('height', '1em');
      expect(svg).toHaveAttribute('width', '1em');
    });

    it('renders an icon for every name in the vocabulary', () => {
      const names = Object.keys(EMOJI_ICONS) as (keyof typeof EMOJI_ICONS)[];
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) {
        const { container } = render(<EmojiIcon name={name} />);
        expect(container.querySelector('svg')).not.toBeNull();
      }
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
      expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Callout Component', () => {
    it('renders callout header with icon and title', () => {
      render(
        <Callout emoji="chat" title="Olya's Tip">
          Great view of the city!
        </Callout>
      );
      const title = screen.getByText("Olya's Tip");
      expect(title).toBeInTheDocument();
      expect(title.parentElement?.querySelector('svg')).toBeInTheDocument();
      expect(screen.getByText('Great view of the city!')).toBeInTheDocument();
    });
  });
});
