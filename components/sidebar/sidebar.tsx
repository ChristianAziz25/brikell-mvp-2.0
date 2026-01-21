'use client';

import { useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Database, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarItem } from './sidebar-item';
import { SidebarHistory } from './sidebar-history';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  simulateErrors: boolean;
  onToggleErrors: () => void;
}

export function Sidebar({ simulateErrors, onToggleErrors }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const handleMouseEnter = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    setIsExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    collapseTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 150);
  }, []);

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 bg-white',
        'flex flex-col transition-all duration-300 ease-out overflow-hidden',
        isExpanded ? 'w-60' : 'w-[60px]',
        'border-r border-gray-100/50'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4">
        <span className="text-lg font-medium text-foreground">
          {isExpanded ? 'Brikell' : 'B'}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Main navigation */}
      <div className="flex-1 py-2 overflow-y-auto">
        <SidebarItem
          icon={<Home className="h-4 w-4" />}
          label="Home"
          isExpanded={isExpanded}
          href="/"
          isActive={pathname === '/'}
        />

        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        <SidebarHistory isExpanded={isExpanded} />

        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        <SidebarItem
          icon={<Database className="h-4 w-4" />}
          label="Data Sources"
          isExpanded={isExpanded}
          href="/data-sources"
          isActive={pathname === '/data-sources'}
        />
      </div>

      {/* Bottom section - Error Toggle */}
      <div className="border-t border-gray-100/50 p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={simulateErrors ? 'destructive' : 'ghost'}
                size={isExpanded ? 'default' : 'icon'}
                onClick={onToggleErrors}
                className={cn(
                  'w-full justify-start gap-3',
                  !isExpanded && 'justify-center'
                )}
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {isExpanded && (
                  <span className="whitespace-nowrap overflow-hidden text-sm">
                    {simulateErrors ? 'Errors: On' : 'Errors: Off'}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Toggle random error simulation (~20% failure rate)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
