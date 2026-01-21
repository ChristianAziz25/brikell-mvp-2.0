'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Database, History, Menu, X, AlertTriangle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

interface HistoryItem {
  id: string;
  title: string;
}

const fakeChatHistory: HistoryItem[] = [
  { id: '1', title: 'Revenue analysis Q4 2024' },
  { id: '2', title: 'Customer segmentation' },
  { id: '3', title: 'Product roadmap review' },
  { id: '4', title: 'Marketing campaign metrics' },
];

interface SidebarProps {
  simulateErrors?: boolean;
  onToggleErrors?: () => void;
}

export function Sidebar({ simulateErrors, onToggleErrors }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    setIsExpanded(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    collapseTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 200);
  }, [isMobile]);

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const sidebarVariants = {
    collapsed: { width: 60 },
    expanded: { width: 300 },
  };

  const sidebarTransition = {
    type: 'spring' as const,
    damping: 28,
    stiffness: 350,
    mass: 0.4,
  };

  const mobileVariants = {
    closed: { x: '-100%' },
    open: { x: 0 },
  };

  // Don't show sidebar on API routes
  if (pathname?.startsWith('/api')) {
    return null;
  }

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger button */}
        <button
          onClick={toggleMobile}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-gray-200 hover:bg-gray-50 transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleMobile}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
              />
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={mobileVariants}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col md:hidden"
              >
                <SidebarContent
                  pathname={pathname}
                  isExpanded={true}
                  onClose={toggleMobile}
                  simulateErrors={simulateErrors}
                  onToggleErrors={onToggleErrors}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop sidebar
  return (
    <motion.aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      transition={sidebarTransition}
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 bg-white',
        'flex flex-col overflow-hidden',
        'border-r border-gray-100'
      )}
    >
      <SidebarContent
        pathname={pathname}
        isExpanded={isExpanded}
        simulateErrors={simulateErrors}
        onToggleErrors={onToggleErrors}
      />
    </motion.aside>
  );
}

interface SidebarContentProps {
  pathname: string | null;
  isExpanded: boolean;
  onClose?: () => void;
  simulateErrors?: boolean;
  onToggleErrors?: () => void;
}

function SidebarContent({
  pathname,
  isExpanded,
  onClose,
  simulateErrors,
  onToggleErrors,
}: SidebarContentProps) {
  const contentVariants = {
    collapsed: { opacity: 0, x: -10 },
    expanded: { opacity: 1, x: 0 },
  };

  return (
    <>
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-gray-100">
        <motion.span
          initial={false}
          animate={isExpanded ? { opacity: 1 } : { opacity: 1 }}
          className="text-lg font-medium text-foreground"
        >
          {isExpanded ? 'Brikell' : 'B'}
        </motion.span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-gray-100 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Main navigation */}
      <div className="flex-1 py-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Home */}
        <Link
          href="/"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground',
            'hover:bg-gray-50/50 hover:text-foreground transition-colors duration-150 ease-out',
            'min-h-[36px] rounded-md mx-2',
            pathname === '/' && 'bg-gray-50/50 text-foreground'
          )}
        >
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            <Home className="h-4 w-4" />
          </span>
          <motion.span
            initial={false}
            animate={isExpanded ? { opacity: 1, width: 'auto' } : { opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="whitespace-nowrap overflow-hidden text-sm"
            style={{ willChange: 'opacity, width' }}
          >
            Home
          </motion.span>
        </Link>

        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        {/* Chat History Section */}
        {isExpanded && (
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            className="px-3 py-1.5"
          >
            <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
              History
            </span>
          </motion.div>
        )}
        {fakeChatHistory.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground',
              'hover:bg-gray-50/50 hover:text-foreground transition-all duration-200 ease-in-out cursor-pointer',
              'min-h-[36px] rounded-md mx-2'
            )}
          >
            <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5" />
            </span>
            <motion.span
              initial={false}
              animate={isExpanded ? { opacity: 1, width: 'auto' } : { opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="whitespace-nowrap overflow-hidden text-ellipsis text-sm text-left"
              style={{ willChange: 'opacity, width' }}
            >
              {item.title}
            </motion.span>
          </button>
        ))}

        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        {/* Data Sources */}
        <Link
          href="/data-sources"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground',
            'hover:bg-gray-50/50 hover:text-foreground transition-colors duration-150 ease-out',
            'min-h-[36px] rounded-md mx-2',
            pathname === '/data-sources' && 'bg-gray-50/50 text-foreground'
          )}
        >
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            <Database className="h-4 w-4" />
          </span>
          <motion.span
            initial={false}
            animate={isExpanded ? { opacity: 1, width: 'auto' } : { opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="whitespace-nowrap overflow-hidden text-sm"
            style={{ willChange: 'opacity, width' }}
          >
            Data Sources
          </motion.span>
        </Link>
      </div>

      {/* Bottom section - Error Toggle (if provided) */}
      {onToggleErrors && (
        <>
          <div className="border-t border-gray-100/50" />
          <div className="p-2">
            <button
              onClick={onToggleErrors}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground',
                'hover:bg-gray-50/50 hover:text-foreground transition-colors duration-150 ease-out',
                'min-h-[36px] rounded-md',
                simulateErrors && 'text-destructive'
              )}
            >
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </span>
              {isExpanded && (
                <motion.span
                  initial={false}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap overflow-hidden text-sm"
                >
                  {simulateErrors ? 'Errors: On' : 'Errors: Off'}
                </motion.span>
              )}
            </button>
          </div>
        </>
      )}
    </>
  );
}
