import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SuggestionChipProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export function SuggestionChip({ icon, label, onClick }: SuggestionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2',
        'rounded-full border border-gray-200 bg-white',
        'text-sm text-foreground',
        'hover:bg-gray-50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-gray-200'
      )}
    >
      <span className="h-4 w-4 text-muted-foreground">{icon}</span>
      {label}
    </button>
  );
}
