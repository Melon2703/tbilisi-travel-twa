import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from '@/components/ui/Button';

describe('Button Component', () => {
  it('meets minimum touch target size guidelines (min-h-[48px])', () => {
    render(
      <div>
        <Button variant="primary">Primary CTA</Button>
        <Button variant="secondary">Secondary CTA</Button>
        <Button variant="outline">Outline CTA</Button>
      </div>
    );

    const primaryBtn = screen.getByRole('button', { name: /Primary CTA/i });
    expect(primaryBtn).toHaveClass('min-h-[48px]');

    const secondaryBtn = screen.getByRole('button', { name: /Secondary CTA/i });
    expect(secondaryBtn).toHaveClass('min-h-[48px]');

    const outlineBtn = screen.getByRole('button', { name: /Outline CTA/i });
    expect(outlineBtn).toHaveClass('min-h-[48px]');
  });
});
