'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  isExpanded: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

export function SidebarItem({
  icon,
  label,
  isExpanded,
  onClick,
  isActive = false,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-2 text-muted-foreground',
        'hover:bg-muted hover:text-foreground transition-colors cursor-pointer',
        'min-h-[40px]',
        isActive && 'bg-muted text-foreground'
      )}
    >
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {icon}
      </span>
      <span
        className={cn(
          'whitespace-nowrap overflow-hidden transition-opacity duration-200',
          isExpanded ? 'opacity-100' : 'opacity-0 w-0'
        )}
      >
        {label}
      </span>
    </button>
  );
}
