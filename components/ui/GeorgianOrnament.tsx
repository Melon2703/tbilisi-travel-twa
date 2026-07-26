import React from 'react';

export interface GeorgianOrnamentProps {
  className?: string;
}

export default function GeorgianOrnament({
  className = 'w-full max-w-[240px] mx-auto',
}: GeorgianOrnamentProps) {
  return (
    <div className="py-0.5 shrink-0 flex justify-center">
      <svg
        viewBox="0 0 240 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <line x1="0" y1="10" x2="90" y2="10" stroke="#C4572A" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="95" cy="10" r="2" fill="#C4572A" fillOpacity="0.5" />
        <path
          d="M105 10 C108 5, 112 5, 115 10 C118 15, 122 15, 125 10 C128 5, 132 5, 135 10"
          stroke="#C4572A"
          strokeWidth="1.5"
          strokeOpacity="0.7"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="145" cy="10" r="2" fill="#C4572A" fillOpacity="0.5" />
        <line x1="150" y1="10" x2="240" y2="10" stroke="#C4572A" strokeWidth="1" strokeOpacity="0.3" />
        <rect x="117" y="7" width="6" height="6" fill="#C4572A" fillOpacity="0.6" transform="rotate(45 120 10)" />
      </svg>
    </div>
  );
}
