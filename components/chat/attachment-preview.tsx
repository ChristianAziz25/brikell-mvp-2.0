'use client';

import { Button } from '@/components/ui/button';
import { Attachment } from '@/lib/types';
import { FileIconByType, XIcon } from '@/components/icons/file-icons';
import { cn } from '@/lib/utils';

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
  className?: string;
}

function truncateFilename(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;

  const ext = name.includes('.') ? name.split('.').pop() : '';
  const nameWithoutExt = ext ? name.slice(0, -(ext.length + 1)) : name;

  const availableLength = maxLength - (ext ? ext.length + 4 : 3);
  if (availableLength <= 0) return name.slice(0, maxLength - 3) + '...';

  return `${nameWithoutExt.slice(0, availableLength)}...${ext ? '.' + ext : ''}`;
}

export function AttachmentPreview({
  attachment,
  onRemove,
  className,
}: AttachmentPreviewProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border',
        className
      )}
    >
      <FileIconByType mimeType={attachment.type} className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-foreground truncate max-w-[150px]">
        {truncateFilename(attachment.name)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(attachment.id)}
        className="h-5 w-5 p-0 hover:bg-transparent"
      >
        <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
      </Button>
    </div>
  );
}
