'use client';

import { cn } from '@/lib/utils';

interface AttachmentDropzoneProps {
  isActive: boolean;
}

export function AttachmentDropzone({ isActive }: AttachmentDropzoneProps) {
  if (!isActive) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-blue-50/90 border-4 border-dashed border-blue-400',
        'transition-opacity duration-200',
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">📎</div>
        <p className="text-lg font-medium text-blue-700">Drop files here</p>
        <p className="text-sm text-blue-600">Up to 10 files, 25MB each</p>
      </div>
    </div>
  );
}
