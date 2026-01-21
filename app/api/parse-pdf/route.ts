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

    // Send to OpenAI for investment memo analysis with streaming
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a senior real estate investment analyst. Extract and analyze investment memo information with precision. Use Danish for section headers but English for analysis. Format currency in DKK where applicable.',
        },
        {
          role: 'user',
          content: `Analyze this investment memo and extract information into these sections. Use bullet points for key data, prose for analysis.

## Ejendom (Property)
- Property name and address
- Property type (residential, commercial, mixed-use)
- Total area (m²) and number of units
- Year built / renovation status

## Pris & Afkast (Price & Returns)
- Purchase price (DKK)
- Net Operating Income (NOI)
- Cap rate (%)
- Expected yield / IRR
- Price per m²

## Vigtige Datoer (Key Dates)
- Closing date
- Due diligence deadline
- Financing contingency
- Other critical milestones

## Deal Highlights
3-5 key reasons this investment is attractive. Be specific about value-add opportunities, location advantages, or market positioning.

## Risici (Risks)
Identify material risks: market, tenant, regulatory, capex, financing. Be direct about concerns.

## Lejere (Tenants)
- Major tenants and their lease terms
- Vacancy rate
- WALT (Weighted Average Lease Term)
- Tenant concentration risk

If any information is not found in the document, note "Ikke angivet" (Not specified).

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
