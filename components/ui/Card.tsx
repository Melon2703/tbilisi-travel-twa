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
    callout: 'bg-[#F3EFEA] border-0 rounded-2xl p-4 sm:p-5 shadow-xs',
    flat: 'bg-[#F3EFEA] border-0 rounded-2xl p-4 sm:p-5 shadow-xs',
    highlight: 'bg-[#F3EFEA] border-0 rounded-2xl p-4 sm:p-5 shadow-xs',
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
