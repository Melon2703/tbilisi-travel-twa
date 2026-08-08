'use client';

import React, { useId } from 'react';
import { NO_CONSTRAINT, type NoConstraint } from '@/lib/engine/catalogFilters';
import Icon, { type IconName } from '@/components/ui/Icon';

/**
 * Every catalog filter is a Soft Constraint — a preference, dressed as a pill that reads
 * as a suggestion. The catalog states no Hard Constraint of its own: a Logistics
 * Constraint is asked for in the bot conversation and enforced by the matching engine.
 */

/** Meets the 48px minimum touch height (DESIGN_SYSTEM.md §4.3). */
const SOFT_CHIP =
  'px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[48px] active:scale-95';

const SELECTED_CHIP = 'bg-[#C4572A] text-white shadow-xs';
const UNSELECTED_CHIP = 'bg-[#F3EFEA] text-[#7A6552] border-0';

/** "No constraint on this axis" is not a preference either way. */
const UNCONSTRAINED_CHIP = 'bg-[#1C1008] text-white shadow-xs';

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
}

export interface FilterChipGroupProps<T extends string> {
  /** Prefix for this group's test ids: `<testIdPrefix>-filter-group`, `-filter-<value>`. */
  testIdPrefix: string;
  /** A name from the icon vocabulary, never a glyph — a stray character fails to compile. */
  icon: IconName;
  label: string;
  unconstrainedLabel: string;
  options: FilterChipOption<T>[];
  selected: T | NoConstraint;
  onSelect: (value: T | NoConstraint) => void;
}

export default function FilterChipGroup<T extends string>({
  testIdPrefix,
  icon,
  label,
  unconstrainedLabel,
  options,
  selected,
  onSelect,
}: FilterChipGroupProps<T>) {
  const labelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      data-testid={`${testIdPrefix}-filter-group`}
      className="space-y-1.5"
    >
      <p id={labelId} className="text-xs font-bold flex items-center gap-1 text-[#7A6552]">
        <Icon name={icon} /> {label}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid={`${testIdPrefix}-filter-all`}
          aria-pressed={selected === NO_CONSTRAINT}
          onClick={() => onSelect(NO_CONSTRAINT)}
          className={`${SOFT_CHIP} ${selected === NO_CONSTRAINT ? UNCONSTRAINED_CHIP : UNSELECTED_CHIP
            }`}
        >
          {unconstrainedLabel}
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            data-testid={`${testIdPrefix}-filter-${option.value}`}
            aria-pressed={selected === option.value}
            onClick={() => onSelect(option.value)}
            className={`${SOFT_CHIP} ${selected === option.value ? SELECTED_CHIP : UNSELECTED_CHIP
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
