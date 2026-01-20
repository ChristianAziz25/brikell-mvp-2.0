export interface ParsePdfResult {
  success: true;
  content: string;
}

export interface ParsePdfError {
  success: false;
  error: string;
}

export type ParsePdfResponse = ParsePdfResult | ParsePdfError;

export async function parsePdf(file: File): Promise<ParsePdfResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    });

    const data: ParsePdfResponse = await response.json();
    return data;
  } catch {
    return {
      success: false,
      error: 'Connection error',
    };
  }
}
