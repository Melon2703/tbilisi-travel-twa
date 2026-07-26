import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'callout' | 'flat' | 'highlight';
  className?: string;
}

export default function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'journal-card',
    callout: 'bg-[#FFF8F3] border border-[rgba(196,87,42,0.15)] rounded-2xl p-4 shadow-xs',
    flat: 'bg-[#FAF7F2] border border-black/10 rounded-2xl p-4 shadow-xs',
    highlight: 'journal-card-highlight',
  };

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
