'use client';

import { useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AttachmentPreview } from './attachment-preview';
import { SuggestionChip } from './suggestion-chip';
import { Attachment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowUp, Plus, Code, Globe, Link } from 'lucide-react';

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFilesSelected: (files: FileList) => void;
  attachments: Attachment[];
  onRemoveAttachment: (id: string) => void;
  isLoading: boolean;
  isCentered: boolean;
}

const suggestions = [
  { icon: Code, label: 'Public data' },
  { icon: Globe, label: 'Web' },
  { icon: Link, label: 'Connectors' },
];

export function ChatComposer({
  value,
  onChange,
  onSend,
  onFilesSelected,
  attachments,
  onRemoveAttachment,
  isLoading,
  isCentered,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (value.trim() || attachments.length > 0)) {
        onSend();
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleSuggestionClick = (label: string) => {
    onChange(label);
    textareaRef.current?.focus();
  };

  const canSend = !isLoading && (value.trim() || attachments.length > 0);

  return (
    <div
      className={cn(
        'w-full transition-all duration-500 ease-out',
        isCentered
          ? 'fixed top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-2xl px-4 md:left-[calc(50%+30px)]'
          : 'fixed bottom-0 left-0 right-0 md:left-[60px] p-4 bg-white border-t border-border'
      )}
    >
      <div className="max-w-4xl mx-auto px-6">
        {isCentered && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Welcome Victor
            </h1>
            <p className="text-lg text-foreground">
              How can I help you
            </p>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
                onRemove={onRemoveAttachment}
              />
            ))}
          </div>
        )}

        <div className="relative">
          {/* Shading around search bar */}
          {isCentered && (
            <div className="absolute -inset-2 bg-gradient-to-b from-gray-100/40 via-gray-50/20 to-transparent rounded-3xl -z-10" />
          )}
          
          {/* Left side icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handlePaperclipClick}
                    disabled={isLoading}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach files</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isCentered ? 'Type / for commands' : 'Type / for commands'}
            className={cn(
              'resize-none rounded-3xl border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-100 shadow-sm',
              isCentered
                ? 'min-h-[100px] py-6 pl-14 pr-16'
                : 'min-h-[100px] py-6 pl-14 pr-16'
            )}
            disabled={isLoading}
          />

          {/* Right side: send button */}
          <div className="absolute top-1/2 -translate-y-1/2 right-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    onClick={onSend}
                    disabled={!canSend}
                    className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message (Enter)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {isCentered && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {suggestions.map((suggestion) => (
              <SuggestionChip
                key={suggestion.label}
                icon={<suggestion.icon className="h-4 w-4" />}
                label={suggestion.label}
                onClick={() => handleSuggestionClick(suggestion.label)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
