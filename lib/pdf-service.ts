export interface ParsePdfResult {
  success: true;
  content: string;
}

export interface ParsePdfError {
  success: false;
  error: string;
}

export type ParsePdfResponse = ParsePdfResult | ParsePdfError;

export async function parsePdfStream(
  file: File,
  onChunk: (chunk: string) => void
): Promise<ParsePdfResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Try to parse error from JSON response
      try {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to parse PDF',
        };
      } catch {
        return {
          success: false,
          error: 'Failed to parse PDF',
        };
      }
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return {
        success: false,
        error: 'Failed to read response stream',
      };
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullContent += chunk;
      onChunk(chunk);
    }

    if (!fullContent.trim()) {
      return {
        success: false,
        error: 'No content extracted',
      };
    }

    return {
      success: true,
      content: fullContent,
    };
  } catch {
    return {
      success: false,
      error: 'Connection error',
    };
  }
}
