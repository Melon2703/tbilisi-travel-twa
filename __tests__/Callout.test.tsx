import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Callout from '@/components/ui/Callout';

describe('Callout Component', () => {
  it('uses soft background tinting (#F3EFEA), rounded-2xl, border-0, generous padding and sentence case header', () => {
    render(
      <Callout icon="chat" title="Historical Overview">
        <p>Callout content</p>
      </Callout>
    );

    const titleElement = screen.getByText('Historical Overview');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.parentElement?.className).not.toContain('uppercase');

    const calloutEl = titleElement.closest('div')?.parentElement;
    expect(calloutEl).toBeInTheDocument();
    expect(calloutEl?.className).toContain('bg-[#F3EFEA]');
    expect(calloutEl?.className).toContain('border-0');
    expect(calloutEl?.className).toContain('rounded-2xl');
    expect(calloutEl?.className).toMatch(/p-(4|5)/);
  });
});
