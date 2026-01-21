'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  isExpanded: boolean;
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
}

export function SidebarItem({
  icon,
  label,
  isExpanded,
  onClick,
  href,
  isActive = false,
}: SidebarItemProps) {
  const content = (
    <>
      <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {icon}
      </span>
      <span
        className={cn(
          'whitespace-nowrap overflow-hidden text-sm transition-opacity duration-200',
          isExpanded ? 'opacity-100' : 'opacity-0 w-0'
        )}
      >
        {label}
      </span>
    </>
  );

  const className = cn(
    'flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground',
    'hover:bg-gray-50/50 hover:text-foreground transition-colors duration-150 cursor-pointer',
    'min-h-[36px] rounded-md',
    isActive && 'bg-gray-50/50 text-foreground'
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}
