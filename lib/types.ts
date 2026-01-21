export interface Attachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string; // MIME type
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments: Attachment[];
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  isStreaming?: boolean;
}

export const MAX_FILES = 10;
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
