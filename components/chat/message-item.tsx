'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LoadingIndicator } from './loading-indicator';
import { FileIconByType } from '@/components/icons/file-icons';

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'animate-message-in',
        isUser ? 'flex justify-end' : 'flex justify-start'
      )}
    >
      <div
        className={cn(
          'py-3',
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
            {isUser ? (
              <div className="text-foreground whitespace-pre-wrap">
                {message.content}
              </div>
            ) : (
              <div className="text-foreground prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2 className="font-semibold text-xl mt-8 mb-3 first:mt-0 pb-2 border-b border-gray-200 text-gray-900">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="font-semibold text-base mt-4 mb-2 text-gray-800">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside ml-5 space-y-2 my-3">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-700 leading-relaxed pl-1">{children}</li>
                    ),
                    p: ({ children }) => (
                      <p className="my-3 leading-relaxed text-gray-700">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {!message.isStreaming && message.content && !isUser && (
              <button
                onClick={handleCopy}
                className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            )}

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
