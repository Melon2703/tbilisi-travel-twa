import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GeorgianOrnament from '@/components/ui/GeorgianOrnament';

describe('GeorgianOrnament Component', () => {
  it('renders an ultra-thin 1px line divider with 10% opacity and no complex SVG shapes', () => {
    const { container } = render(<GeorgianOrnament />);

    const divider = container.querySelector('[data-testid="line-divider"]') || container.firstElementChild;
    expect(divider).toBeInTheDocument();
    expect(divider?.className).toContain('h-px');
    expect(divider?.className).toContain('bg-[#C4572A]/10');
    expect(container.querySelector('svg')).toBeNull();
  });
});
