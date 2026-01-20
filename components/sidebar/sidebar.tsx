'use client';

import { useState, useRef, useCallback } from 'react';
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
        'fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-border',
        'flex flex-col transition-all duration-200 ease-out overflow-hidden',
        isExpanded ? 'w-60' : 'w-[60px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border">
        <span className="text-xl font-bold text-foreground">
          {isExpanded ? 'Brikell' : 'B'}
        </span>
      </div>

      {/* Main navigation */}
      <div className="flex-1 py-2 overflow-y-auto">
        <SidebarItem
          icon={<Home className="h-5 w-5" />}
          label="Home"
          isExpanded={isExpanded}
        />

        {/* Divider */}
        <div className="my-2 mx-3 border-t border-border" />

        {/* History section */}
        <SidebarHistory isExpanded={isExpanded} />

        {/* Divider */}
        <div className="my-2 mx-3 border-t border-border" />

        {/* Data Sources */}
        <SidebarItem
          icon={<Database className="h-5 w-5" />}
          label="Data Sources"
          isExpanded={isExpanded}
        />
      </div>

      {/* Bottom section - Error Toggle */}
      <div className="border-t border-border p-2">
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
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="whitespace-nowrap overflow-hidden">
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
