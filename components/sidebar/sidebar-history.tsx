'use client';

import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  title: string;
}

const mockHistory: HistoryItem[] = [
  { id: '1', title: 'Revenue analysis Q4 2024' },
  { id: '2', title: 'Customer segmentation' },
  { id: '3', title: 'Product roadmap review' },
  { id: '4', title: 'Marketing campaign metrics' },
];

interface SidebarHistoryProps {
  isExpanded: boolean;
}

export function SidebarHistory({ isExpanded }: SidebarHistoryProps) {
  return (
    <div className="flex flex-col">
      {isExpanded && (
        <span className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          History
        </span>
      )}
      {mockHistory.map((item) => (
        <button
          key={item.id}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-2 text-muted-foreground',
            'hover:bg-muted hover:text-foreground transition-colors cursor-pointer',
            'min-h-[40px]'
          )}
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <MessageSquare className="h-4 w-4" />
          </span>
          <span
            className={cn(
              'whitespace-nowrap overflow-hidden text-ellipsis text-sm text-left',
              'transition-opacity duration-200',
              isExpanded ? 'opacity-100' : 'opacity-0 w-0'
            )}
          >
            {item.title}
          </span>
        </button>
      ))}
    </div>
  );
}
