import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'terracotta' | 'dark' | 'subtle' | 'visited' | 'frosted' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'terracotta',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wide shrink-0 transition-all';

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  const variantClasses = {
    terracotta: 'bg-[#C4572A] text-white shadow-xs',
    dark: 'bg-black/60 text-[#FAF7F2] border border-white/20 backdrop-blur-xs',
    subtle: 'bg-[rgba(28,16,8,0.08)] text-[#1C1008] border border-black/10',
    visited: 'bg-[#228255]/10 text-[#228255] font-semibold',
    frosted: 'backdrop-blur-md bg-black/50 text-[#FAF7F2] border border-white/20 shadow-xs',
    outline: 'border border-black/10 text-[#7A6552] bg-black/5 font-semibold',
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
