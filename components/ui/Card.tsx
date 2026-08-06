import React from 'react';
import { COLORS } from '@/lib/theme/tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'callout' | 'flat' | 'highlight';
  className?: string;
}

export default function Card({
  children,
  variant = 'default',
  className = '',
  style,
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'journal-card',
    callout: 'bg-[#F3EFEA] border-0 rounded-2xl p-4 sm:p-5 shadow-xs',
    flat: 'bg-[#F3EFEA] border-0 rounded-2xl p-4 sm:p-5 shadow-xs',
    // An advisory the traveler acts on here and now — deliberately distinct
    // from the neutral callout surface the Route Intro Card summarises on.
    highlight: 'border border-l-4 rounded-2xl p-4 sm:p-5 shadow-xs',
  };

  const variantStyle =
    variant === 'highlight'
      ? {
          backgroundColor: COLORS.advisoryBg,
          borderColor: COLORS.advisoryBorder,
          borderLeftColor: COLORS.terracottaAccent,
        }
      : undefined;

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
