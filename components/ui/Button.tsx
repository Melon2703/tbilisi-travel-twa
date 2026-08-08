import React from 'react';
import EmojiIcon, { KnownEmojiIconName } from './EmojiIcon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'visited';
  emoji?: KnownEmojiIconName;
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
    primary: 'journal-btn-cta w-full min-h-[48px]',
    secondary: 'bg-[rgba(28,16,8,0.08)] text-[#1C1008] font-bold py-3.5 px-6 min-h-[48px] rounded-2xl flex items-center justify-center gap-2 text-sm',
    outline: 'border border-[#C4572A]/30 text-[#C4572A] bg-transparent font-bold py-3.5 px-6 min-h-[48px] rounded-2xl flex items-center justify-center gap-2 text-sm',
    visited: 'bg-[#228255] text-white shadow-md font-bold py-3.5 px-6 min-h-[48px] rounded-2xl flex items-center justify-center gap-2 text-sm',
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
