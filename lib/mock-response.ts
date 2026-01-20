import { Attachment, ChatMessage } from './types';
import { v4 as uuidv4 } from 'uuid';

export async function generateMockResponse(
  userMessage: string,
  attachments: Attachment[],
  simulateErrors: boolean
): Promise<ChatMessage> {
  // Simulate network delay (1-2 seconds)
  const delay = 1000 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Random 20% failure rate when errors are enabled
  if (simulateErrors && Math.random() < 0.2) {
    return {
      id: uuidv4(),
      role: 'assistant',
      content: 'Sorry, something went wrong. Please try again.',
      attachments: [],
      timestamp: new Date(),
      isError: true,
    };
  }

  // Build response content
  let content = `You said: "${userMessage}"`;

  if (attachments.length > 0) {
    const fileList = attachments.map((a) => `• ${a.name}`).join('\n');
    content += `\n\nYou attached ${attachments.length} file${attachments.length > 1 ? 's' : ''}:\n${fileList}`;
  }

  return {
    id: uuidv4(),
    role: 'assistant',
    content,
    attachments: [],
    timestamp: new Date(),
  };
}
