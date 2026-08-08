import React from 'react';
import Card from './Card';
import Icon, { IconName } from './Icon';

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon?: IconName;
  title: string;
  variant?: 'default' | 'warning' | 'tip';
  className?: string;
}

export default function Callout({
  children,
  icon,
  title,
  variant = 'default',
  className = '',
  ...props
}: CalloutProps) {
  const cardVariant = variant === 'warning' ? 'highlight' : 'callout';

  return (
    <Card variant={cardVariant} className={`space-y-1.5 ${className}`} {...props}>
      <div className="flex items-center gap-2 text-[#C4572A] font-bold text-xs">
        {icon && <Icon name={icon} />}
        <span>{title}</span>
      </div>
      <div className="text-xs sm:text-sm text-[#4A3828] leading-relaxed font-medium">
        {children}
      </div>
    </Card>
  );
}
