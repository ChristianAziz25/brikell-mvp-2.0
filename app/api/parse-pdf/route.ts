import { NextRequest, NextResponse } from 'next/server';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import OpenAI from 'openai';

// Use local worker file for PDF parsing
import { join } from 'path';

pdfjs.GlobalWorkerOptions.workerSrc = join(
  process.cwd(),
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs'
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  }).promise;

  let fullText = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n\n';
  }

  await doc.destroy();
  return fullText;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text
    let extractedText: string;
    try {
      extractedText = await extractTextFromPdf(buffer);
    } catch (err) {
      console.error('PDF parse error:', err);
      return NextResponse.json(
        { success: false, error: 'Failed to parse PDF' },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'PDF contains no extractable text' },
        { status: 400 }
      );
    }

    // Send to OpenAI for comprehensive analysis with streaming
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a senior financial analyst. Provide focused, precise analysis using short prose paragraphs (4-6 sentences each). No fluff — be direct and actionable.',
        },
        {
          role: 'user',
          content: `Analyze this document with exactly these 5 sections. Each section should be a focused prose paragraph of 4-6 sentences. No bullet points.

## Key Parties
Identify all parties involved, their roles, relationships, and stakes in the document.

## Primary Findings
The most significant discoveries, conclusions, and implications from the document.

## Financial Deep Dive
Comprehensive financials: revenue, margins (gross/net), cash flow, burn rate, debt levels, projections, and any red flags.

## Market Size & Competitive Analysis
TAM/SAM/SOM, market dynamics, competitive positioning, key competitors, differentiation.

## Potential Capex Risks
Equipment and infrastructure capital risks: major equipment needs, facility investments, technology infrastructure, maintenance obligations, replacement cycles.

Document text:
${extractedText}`,
        },
      ],
      max_tokens: 4000,
      stream: true,
    });

    // Return streaming response
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || '';
              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      }
    );
  } catch (error) {
    console.error('PDF parsing error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { success: false, error: 'Failed to process document' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
