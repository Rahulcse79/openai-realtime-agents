import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Proxy endpoint for the OpenAI Responses API
export async function POST(req: NextRequest) {
  const body = await req.json();

  const apiKey = "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";
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OPENAI_API_KEY' },
      { status: 500 },
    );
  }

  const openai = new OpenAI({ apiKey });

  if (body.text?.format?.type === 'json_schema') {
    return await structuredResponse(openai, body);
  } else {
    return await textResponse(openai, body);
  }
}

async function structuredResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.parse({
      ...(body as any),
      stream: false,
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 }); 
  }
}

async function textResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.create({
      ...(body as any),
      stream: false,
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
  