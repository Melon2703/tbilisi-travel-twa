import React from 'react';

export interface GeorgianOrnamentProps {
  className?: string;
}

export default function GeorgianOrnament({
  className = 'w-full my-2',
}: GeorgianOrnamentProps) {
  return (
    <div
      data-testid="line-divider"
      className={`h-px shrink-0 bg-[#C4572A]/10 ${className}`}
      aria-hidden="true"
    />
  );
}

