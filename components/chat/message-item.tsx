'use client';

import { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LoadingIndicator } from './loading-indicator';
import { FileIconByType } from '@/components/icons/file-icons';

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'animate-message-in',
        isUser ? 'flex justify-end' : 'flex justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] py-3',
          isUser ? 'text-right' : 'text-left',
          message.isError && 'text-destructive'
        )}
      >
        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
          {isUser ? 'You' : 'Assistant'}
        </div>

        {message.isLoading ? (
          <LoadingIndicator />
        ) : (
          <>
            <div className="text-foreground whitespace-pre-wrap">
              {message.content}
            </div>

            {message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground"
                  >
                    <FileIconByType mimeType={attachment.type} className="h-3 w-3" />
                    <span>{attachment.name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
