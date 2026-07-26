import React from 'react';
import EmojiIcon, { EmojiIconName } from './EmojiIcon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'visited';
  emoji?: EmojiIconName;
  emojiPosition?: 'left' | 'right';
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  emoji,
  emojiPosition = 'right',
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'journal-btn-cta w-full hover:bg-[#b04b22]',
    secondary: 'bg-[rgba(28,16,8,0.08)] text-[#1C1008] hover:bg-[rgba(28,16,8,0.12)] font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.18em]',
    outline: 'border border-[#C4572A]/30 text-[#C4572A] bg-transparent hover:bg-[#C4572A]/5 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.18em]',
    visited: 'bg-[#228255] text-white shadow-md font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.18em]',
  };

  return (
    <button
      type="button"
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {emoji && emojiPosition === 'left' && <EmojiIcon name={emoji} />}
      <span>{children}</span>
      {emoji && emojiPosition === 'right' && <EmojiIcon name={emoji} />}
    </button>
  );
}
