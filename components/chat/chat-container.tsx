'use client';

import { useState, useCallback, DragEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { ChatComposer } from './chat-composer';
import { MessageList } from './message-list';
import { AttachmentDropzone } from './attachment-dropzone';
import { Sidebar } from '@/components/ui/sidebar';
import { ChatMessage, Attachment, MAX_FILES, MAX_FILE_SIZE_BYTES } from '@/lib/types';
import { generateMockResponse } from '@/lib/mock-response';
import { parsePdfStream } from '@/lib/pdf-service';
import { parseRentRoll, isRentRollFile, isPdfFile } from '@/lib/rent-roll-service';

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [simulateErrors, setSimulateErrors] = useState(false);

  const isFirstMessage = messages.length === 0;

  const validateAndAddFiles = useCallback((files: FileList) => {
    const newFiles: Attachment[] = [];
    let hasErrors = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File "${file.name}" exceeds 25MB limit`);
        hasErrors = true;
        continue;
      }

      // Check total count
      if (pendingAttachments.length + newFiles.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        hasErrors = true;
        break;
      }

      newFiles.push({
        id: uuidv4(),
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      });
    }

    if (newFiles.length > 0) {
      setPendingAttachments((prev) => [...prev, ...newFiles]);
    }

    return !hasErrors;
  }, [pendingAttachments.length]);

  const handleFilesSelected = useCallback((files: FileList) => {
    validateAndAddFiles(files);
  }, [validateAndAddFiles]);

  const handleRemoveAttachment = useCallback((id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content && pendingAttachments.length === 0) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      attachments: [...pendingAttachments],
      timestamp: new Date(),
    };

    // Add user message and clear input
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    const sentAttachments = [...pendingAttachments];
    setPendingAttachments([]);

    // Check for rent roll files (Excel only)
    const rentRollAttachment = sentAttachments.find((a) => isRentRollFile(a.file));
    // Check for PDF files (investment memos)
    const pdfAttachment = sentAttachments.find((a) => isPdfFile(a.file));

    if (rentRollAttachment) {
      // Create loading placeholder
      const loadingId = uuidv4();
      setMessages((prev) => [
        ...prev,
        {
          id: loadingId,
          role: 'assistant',
          content: '',
          attachments: [],
          timestamp: new Date(),
          isLoading: true,
        },
      ]);
      setIsAssistantTyping(true);

      // Parse rent roll via backend
      const result = await parseRentRoll(rentRollAttachment.file);

      if (result.success) {
        // Store the parsed result for the summary card component
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingId
              ? {
                  ...msg,
                  content: '',
                  isLoading: false,
                  rentRollResult: result,
                }
              : msg
          )
        );
      } else {
        // Show error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingId
              ? {
                  ...msg,
                  content: `**Error parsing file:** ${result.message}`,
                  isLoading: false,
                  isError: true,
                }
              : msg
          )
        );
        toast.error(result.message);
      }

      setIsAssistantTyping(false);
    } else if (pdfAttachment) {
      // Create loading placeholder for PDF analysis
      const loadingId = uuidv4();
      setMessages((prev) => [
        ...prev,
        {
          id: loadingId,
          role: 'assistant',
          content: 'Analyserer dokument...',
          attachments: [],
          timestamp: new Date(),
          isLoading: true,
        },
      ]);
      setIsAssistantTyping(true);

      try {
        // Parse PDF via OpenAI streaming
        await parsePdfStream(pdfAttachment.file, (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingId
                ? {
                    ...msg,
                    content: msg.content === 'Analyserer dokument...' ? chunk : msg.content + chunk,
                    isLoading: true,
                  }
                : msg
            )
          );
        });

        // Mark as complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingId
              ? { ...msg, isLoading: false }
              : msg
          )
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze PDF';
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingId
              ? {
                  ...msg,
                  content: `**Error analyzing PDF:** ${errorMessage}`,
                  isLoading: false,
                  isError: true,
                }
              : msg
          )
        );
        toast.error(errorMessage);
      }

      setIsAssistantTyping(false);
    } else {
      // Create loading placeholder for non-PDF
      const loadingId = uuidv4();
      setMessages((prev) => [
        ...prev,
        {
          id: loadingId,
          role: 'assistant',
          content: '',
          attachments: [],
          timestamp: new Date(),
          isLoading: true,
        },
      ]);
      setIsAssistantTyping(true);

      // Generate mock response for non-PDF attachments
      const response = await generateMockResponse(
        content,
        sentAttachments,
        simulateErrors
      );

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId ? response : msg
        )
      );
      setIsAssistantTyping(false);
    }
  }, [inputValue, pendingAttachments, simulateErrors]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the container entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDraggingFile(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, [validateAndAddFiles]);

  return (
    <div
      className="min-h-screen bg-white"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Sidebar
        simulateErrors={simulateErrors}
        onToggleErrors={() => setSimulateErrors((prev) => !prev)}
      />

      <div className="ml-0 md:ml-[60px]">
        <AttachmentDropzone isActive={isDraggingFile} />

        {!isFirstMessage && <MessageList messages={messages} />}

        <ChatComposer
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          onFilesSelected={handleFilesSelected}
          attachments={pendingAttachments}
          onRemoveAttachment={handleRemoveAttachment}
          isLoading={isAssistantTyping}
          isCentered={isFirstMessage}
        />
      </div>
    </div>
  );
}
