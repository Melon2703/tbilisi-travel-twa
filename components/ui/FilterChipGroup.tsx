'use client';

import React, { useId } from 'react';
import { NO_CONSTRAINT, type NoConstraint } from '@/lib/engine/catalogFilters';

/**
 * A Hard Constraint is a fact about the traveler's body; a Soft Constraint is a
 * preference. The two are never dressed alike: Soft Constraints are pills that read
 * as suggestions, the Hard Constraint is a boxed, squared, green block that reads as a
 * requirement — and says outright that it is never relaxed.
 */
export type ConstraintKind = 'hard' | 'soft';

/** Both meet the 48px minimum touch height (DESIGN_SYSTEM.md §4.3). */
export const SOFT_CHIP =
  'px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[48px] active:scale-95';
export const HARD_CHIP =
  'px-4 py-2 rounded-lg text-xs font-bold transition-all min-h-[48px] active:scale-95';

const SELECTED_CHIP: Record<ConstraintKind, string> = {
  soft: 'bg-[#C4572A] text-white shadow-xs',
  hard: 'bg-[#228255] text-white shadow-xs ring-2 ring-[#228255]/30',
};

const UNSELECTED_CHIP: Record<ConstraintKind, string> = {
  soft: 'bg-[#F3EFEA] text-[#7A6552] border-0',
  hard: 'bg-white text-[#7A6552] border border-[#228255]/25',
};

/** Shared by both kinds: "no constraint on this axis" is not a preference either way. */
const UNCONSTRAINED_CHIP = 'bg-[#1C1008] text-white shadow-xs';

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
}

export interface FilterChipGroupProps<T extends string> {
  kind: ConstraintKind;
  /** Prefix for this group's test ids: `<testIdPrefix>-filter-group`, `-filter-<value>`. */
  testIdPrefix: string;
  icon: string;
  label: string;
  /** Shown under the label on a Hard Constraint — why it will not bend. */
  note?: string;
  unconstrainedLabel: string;
  options: FilterChipOption<T>[];
  selected: T | NoConstraint;
  onSelect: (value: T | NoConstraint) => void;
}

export default function FilterChipGroup<T extends string>({
  kind,
  testIdPrefix,
  icon,
  label,
  note,
  unconstrainedLabel,
  options,
  selected,
  onSelect,
}: FilterChipGroupProps<T>) {
  const labelId = useId();
  const chip = kind === 'hard' ? HARD_CHIP : SOFT_CHIP;

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      data-testid={`${testIdPrefix}-filter-group`}
      data-constraint={kind}
      className={
        kind === 'hard'
          ? 'space-y-2 rounded-2xl border-2 border-[#228255]/35 bg-[#228255]/6 p-4'
          : 'space-y-1.5'
      }
    >
      <div className="space-y-0.5">
        <p
          id={labelId}
          className={`text-xs font-bold flex items-center gap-1 ${kind === 'hard' ? 'text-[#1C1008]' : 'text-[#7A6552]'
            }`}
        >
          <span aria-hidden="true">{icon}</span> {label}
        </p>
        {note && (
          <p
            data-testid="hard-constraint-note"
            className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#228255]"
          >
            {note}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid={`${testIdPrefix}-filter-all`}
          aria-pressed={selected === NO_CONSTRAINT}
          onClick={() => onSelect(NO_CONSTRAINT)}
          className={`${chip} ${selected === NO_CONSTRAINT ? UNCONSTRAINED_CHIP : UNSELECTED_CHIP[kind]
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
            className={`${chip} ${selected === option.value ? SELECTED_CHIP[kind] : UNSELECTED_CHIP[kind]
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
