import { RentRollResult } from './rent-roll-service';

export interface Attachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string; // MIME type
}

export interface ProcessingStatus {
  excelStatus: 'pending' | 'processing' | 'complete' | 'error' | 'skipped';
  pdfStatus: 'pending' | 'processing' | 'complete' | 'error' | 'skipped';
  excelError?: string;
  pdfError?: string;
  currentStep: string;
  progress: number; // 0-100
}

export interface CombinedAnalysisResult {
  rentRoll?: RentRollResult;
  investmentMemo?: string;
  processingStatus: ProcessingStatus;
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
  rentRollResult?: RentRollResult;
  combinedResult?: CombinedAnalysisResult;
}

export const MAX_FILES = 10;
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
