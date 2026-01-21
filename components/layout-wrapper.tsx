'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
  simulateErrors?: boolean;
  onToggleErrors?: () => void;
}

export function LayoutWrapper({
  children,
  simulateErrors,
  onToggleErrors,
}: LayoutWrapperProps) {
  const pathname = usePathname();

  // Don't show sidebar on API routes
  const showSidebar = pathname && !pathname.startsWith('/api');

  return (
    <>
      {showSidebar && (
        <Sidebar
          simulateErrors={simulateErrors}
          onToggleErrors={onToggleErrors}
        />
      )}
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          showSidebar ? 'ml-[60px] md:ml-[60px]' : 'ml-0'
        )}
      >
        {children}
      </div>
    </>
  );
}

function cn(...inputs: (string | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}
